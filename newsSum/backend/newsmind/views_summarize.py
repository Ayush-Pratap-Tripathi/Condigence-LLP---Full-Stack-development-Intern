# backend/newsmind/views_summarize.py

import os
import time
import re
import math
from datetime import datetime
from typing import List

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import JSONParser

from pymongo import MongoClient
from huggingface_hub import InferenceClient

# Try to import tokenizer for accurate token counting; if not available, we'll fallback.
try:
    from transformers import AutoTokenizer

    TRANSFORMERS_AVAILABLE = True
except Exception:
    TRANSFORMERS_AVAILABLE = False

User = get_user_model()

# ---- CONFIG ----
HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_MODEL = os.getenv("HF_MODEL", "google/pegasus-xsum")

MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DBNAME = os.getenv("MONGO_DBNAME", "newssum_mongo")

# token threshold for single-shot summarization (you requested 510)
MAX_TOKENS = int(os.getenv("SUMMARY_MAX_TOKENS", "510"))

# sleep between HF calls (seconds)
HF_CALL_SLEEP = float(os.getenv("HF_CALL_SLEEP", "0.35"))

# Create HF client
HF_CLIENT = None
if HF_API_KEY:
    HF_CLIENT = InferenceClient(provider="hf-inference", api_key=HF_API_KEY)


# --- Helpers: Mongo ---
def connect_mongo():
    if not MONGO_URI:
        raise RuntimeError("MONGO_URI is not configured.")
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DBNAME]
    return client, db


# --- Helpers: Text prep (unchanged) ---
def prepare_input_text(article: dict) -> str:
    """
    Build a clean input string for Pegasus.
    We'll prefer: content -> raw.text -> description.
    The model will receive: "<title>\n\n<body>"
    """
    title = article.get("title", "") or ""
    desc = article.get("description", "") or ""
    content = article.get("content", "") or ""
    raw_text = (article.get("raw") or {}).get("text", "") or ""

    body = content.strip() or raw_text.strip() or desc.strip()
    input_text = f"{title.strip()}\n\n{body.strip()}"
    return input_text.strip()


# --- Helpers: Token counting ---
_tokenizer = None


def _get_tokenizer():
    global _tokenizer
    if _tokenizer is not None:
        return _tokenizer
    if TRANSFORMERS_AVAILABLE:
        try:
            # use the model name if possible; fallback to generic 'facebook/bart-large-cnn' tokenizer if model not found locally
            _tokenizer = AutoTokenizer.from_pretrained(HF_MODEL, use_fast=True)
            return _tokenizer
        except Exception:
            try:
                _tokenizer = AutoTokenizer.from_pretrained(
                    "sshleifer/distilbart-cnn-12-6", use_fast=True
                )
                return _tokenizer
            except Exception:
                _tokenizer = None
                return None
    return None


def estimate_token_count(text: str) -> int:
    """
    Return an integer token estimate.
    Prefer using transformers tokenizer if available, else fallback to char heuristic (1 token ≈ 4 characters).
    This fallback intentionally overestimates slightly to be safe.
    """
    if not text:
        return 0
    tok = _get_tokenizer()
    if tok:
        try:
            # encode without adding special tokens to estimate raw tokens
            # fast tokenizers support encode/encode_plus -> we use encode
            ids = tok.encode(text, add_special_tokens=False)
            return len(ids)
        except Exception:
            # if tokenizer fails for any reason, fallback
            pass
    # fallback heuristic: average token length 4 chars
    return math.ceil(len(text) / 4)


# --- Helpers: Sentence-based chunking by tokens ---
_sentence_split_re = re.compile(r"(?<=[\.\!\?])\s+")


def chunk_text_by_sentences_and_tokens(
    text: str, max_tokens: int = MAX_TOKENS
) -> List[str]:
    """
    Split `text` into chunks such that each chunk ends at a sentence boundary and
    has token_count <= max_tokens (based on estimate_token_count).
    If a single sentence exceeds max_tokens, it will be truncated safely to max_tokens characters (not tokens) as a last resort.
    """
    if not text:
        return []

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    # Split into sentences (approx.)
    sentences = _sentence_split_re.split(text)
    chunks = []
    cur_sentences = []
    cur_text = ""
    cur_tokens = 0

    for s in sentences:
        s = s.strip()
        if not s:
            continue
        s_tokens = estimate_token_count(s)
        # if single sentence alone > max_tokens, truncate it (last resort)
        if s_tokens > max_tokens:
            # truncate by characters conservatively
            # We attempt to find a point close to max_tokens*4 chars
            approx_chars = max_tokens * 4
            truncated = s[
                : max(approx_chars - 50, 1000)
            ].rstrip()  # keep at least some text
            # finalize current chunk if exists
            if cur_sentences:
                chunks.append(" ".join(cur_sentences).strip())
                cur_sentences = []
            chunks.append(truncated)
            cur_text = ""
            cur_tokens = 0
            continue

        # if adding this sentence would exceed limit, flush current chunk
        if cur_sentences and (cur_tokens + s_tokens) > max_tokens:
            chunks.append(" ".join(cur_sentences).strip())
            cur_sentences = [s]
            cur_tokens = s_tokens
        else:
            cur_sentences.append(s)
            cur_tokens += s_tokens

    if cur_sentences:
        chunks.append(" ".join(cur_sentences).strip())

    return chunks


# --- HF summarization wrapper (single-shot) ---
def run_summarization_once(text: str) -> str:
    """
    Call the HF InferenceClient for one-shot summarization of `text`.
    Returns the summary string or raises RuntimeError on failure.
    """
    if HF_CLIENT is None:
        raise RuntimeError(
            "Hugging Face Inference client not configured (HF_API_KEY missing)."
        )

    try:
        result = HF_CLIENT.summarization(text, model=HF_MODEL)
    except Exception as e:
        raise RuntimeError(f"Hugging Face inference error: {e}")

    # normalize result
    if isinstance(result, list) and len(result) > 0:
        first = result[0]
        if isinstance(first, dict):
            if "summary_text" in first:
                return first["summary_text"]
            if "generated_text" in first:
                return first["generated_text"]
            # fallback: stringify value fields
            return str(first)
        return str(first)

    if isinstance(result, dict):
        return result.get("summary_text") or result.get("generated_text") or str(result)

    return str(result)


# --- Recursive summarization strategy ---
def summarize_recursive(text: str, max_tokens: int = MAX_TOKENS) -> str:
    """
    If text token count <= max_tokens -> one-shot summarize.
    Else -> chunk into sentence-safe pieces each <= max_tokens, summarize each chunk,
            combine chunk-summaries and call summarize_recursive on the combined summary.
    This reduces arbitrarily long text hierarchically.
    """
    if not text or not text.strip():
        return ""

    token_count = estimate_token_count(text)
    # one-shot
    if token_count <= max_tokens:
        return run_summarization_once(text)

    # else chunk
    chunks = chunk_text_by_sentences_and_tokens(text, max_tokens=max_tokens)
    if not chunks:
        # extreme fallback: trim text to a safe char length
        trimmed = text[: max_tokens * 4]
        return run_summarization_once(trimmed)

    chunk_summaries = []
    for ch in chunks:
        # summarize each chunk (safe single-shot)
        s = run_summarization_once(ch)
        chunk_summaries.append(s)
        # polite sleep
        time.sleep(HF_CALL_SLEEP)

    combined = "\n\n".join(chunk_summaries).strip()
    # recurse: combined summary likely much smaller
    return summarize_recursive(combined, max_tokens=max_tokens)


# --- API View ---
class SummarizeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        user = request.user
        article = request.data

        if not article:
            return Response(
                {"detail": "Missing article data."}, status=status.HTTP_400_BAD_REQUEST
            )

        # prepare input (title + body)
        input_text = prepare_input_text(article)
        if not input_text:
            return Response(
                {"detail": "Article contains no text to summarize."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            generated_summary = summarize_recursive(input_text, max_tokens=MAX_TOKENS)
        except RuntimeError as e:
            return Response(
                {"detail": "AI summarization failed", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"detail": "Summarization error", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to MongoDB (unchanged)
        try:
            client, db = connect_mongo()
            coll_name = getattr(user, "mongo_collection_name", None)
            if not coll_name:
                coll_name = f"user_{user.id}_summaries"
                user.mongo_collection_name = coll_name
                user.save(update_fields=["mongo_collection_name"])

            col = db[coll_name]
            doc = {
                "user_id": user.id,
                "created_at": datetime.utcnow(),
                "article": article,
                "summary": generated_summary,
                "title": article.get("title"),
                "url": article.get("url"),
                "image": article.get("image"),
                "publishedAt": article.get("publishedAt"),
                "source": article.get("source"),
            }
            res = col.insert_one(doc)
            saved_id = str(res.inserted_id)
        except Exception as e:
            return Response(
                {"detail": "Failed to save summary", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            try:
                client.close()
            except Exception:
                pass

        return Response(
            {
                "summary": generated_summary,
                "saved_id": saved_id,
                "saved_collection": coll_name,
            },
            status=status.HTTP_201_CREATED,
        )


class UserSummaryListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.mongo_collection_name:
            return Response({"summaries": []}, status=status.HTTP_200_OK)

        client = MongoClient(os.getenv("MONGO_URI"))
        db = client["newssum_mongo"]
        collection = db[user.mongo_collection_name]

        summaries = list(
            collection.find(
                {},
                {"_id": 1, "title": 1, "summary": 1, "created_at": 1, "source_url": 1},
            ).sort("created_at", -1)
        )

        # Convert ObjectId → string
        for s in summaries:
            s["_id"] = str(s["_id"])

        client.close()

        return Response({"summaries": summaries}, status=status.HTTP_200_OK)
