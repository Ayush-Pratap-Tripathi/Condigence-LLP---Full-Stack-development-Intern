# backend/newsmind/views_summarize.py
import os
import time
from datetime import datetime
from typing import List

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import JSONParser

from pymongo import MongoClient, errors as pymongo_errors

# Hugging Face client
from huggingface_hub import InferenceClient
from huggingface_hub.utils import hf_raise_for_status

User = get_user_model()

# --- Configuration (tweak if needed) ---
HF_API_KEY = os.getenv("HF_API_KEY", "")  # your HF token
HF_MODEL = os.getenv("HF_MODEL", "google/pegasus-xsum")
MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DBNAME = os.getenv("MONGO_DBNAME", "newssum_mongo")

CHUNK_CHAR_SIZE = int(os.getenv("SUMMARY_CHUNK_CHAR", "16000"))
CHUNK_OVERLAP = int(os.getenv("SUMMARY_CHUNK_OVERLAP", "300"))

# A small pause between calls to reduce throttling
HF_CALL_SLEEP = float(os.getenv("HF_CALL_SLEEP", "0.3"))

# Create a single InferenceClient instance (safe to reuse)
if not HF_API_KEY:
    INFERENCE_CLIENT = None
else:
    try:
        INFERENCE_CLIENT = InferenceClient(provider="hf-inference", api_key=HF_API_KEY)
    except Exception:
        # fallback: try constructing an InferenceApi for the model (older interface)
        INFERENCE_CLIENT = None


def _chunk_text(
    text: str, size: int = CHUNK_CHAR_SIZE, overlap: int = CHUNK_OVERLAP
) -> List[str]:
    if not text:
        return []
    text = text.strip()
    n = len(text)
    if n <= size:
        return [text]
    chunks = []
    start = 0
    while start < n:
        end = start + size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
        if start < 0:
            start = 0
    return chunks


def _connect_mongo():
    if not MONGO_URI:
        raise RuntimeError("MONGO_URI not configured.")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()  # test connection
        db = client[MONGO_DBNAME]
        return client, db
    except pymongo_errors.PyMongoError as e:
        raise RuntimeError(f"Failed to connect to MongoDB: {e}")


def _hf_summarize_via_client(text: str):
    """
    Summarize `text` using the huggingface_hub.InferenceClient.
    Returns the generated summary string on success, raises RuntimeError on failure.
    """
    if INFERENCE_CLIENT is None:
        raise RuntimeError(
            "InferenceClient not configured. Ensure HF_API_KEY is set and huggingface_hub is installed."
        )

    # Use the client.summarization helper if available; otherwise use the generic inference API call
    try:
        # several client methods exist; prefer the convenience method if present
        if hasattr(INFERENCE_CLIENT, "summarization"):
            # returns a list/dict depending on model; handle shapes below
            out = INFERENCE_CLIENT.summarization(text, model=HF_MODEL)
        else:
            # fallback: use generic inference API for model
            # InferenceClient.model_inference/model_... interfaces vary by version.
            # Use the InferenceApi convenience wrapper if needed:
            api = InferenceApi(repo_id=HF_MODEL, token=HF_API_KEY)
            out = api(inputs=text, parameters={"max_length": 200, "min_length": 30})
    except Exception as e:
        # include underlying message for easier debugging (do not leak API keys)
        raise RuntimeError(f"Hugging Face inference error: {e}")

    # normalize output
    # Many HF summarization models return a list like [{"summary_text": "..."}]
    try:
        if isinstance(out, list) and len(out):
            first = out[0]
            if isinstance(first, dict) and "summary_text" in first:
                return first["summary_text"]
            # sometimes it returns [{"generated_text": "..."}]
            if isinstance(first, dict) and "generated_text" in first:
                return first["generated_text"]
            # as fallback, string-ize the first element
            return str(first)
        if isinstance(out, dict):
            # might be {"summary_text": "..."} or other shapes
            if "summary_text" in out:
                return out["summary_text"]
            if "generated_text" in out:
                return out["generated_text"]
            # fallback to stringification
            return str(out)
        # maybe it's already a plain string
        return str(out)
    except Exception as e:
        raise RuntimeError(f"Failed to parse HF response: {e}")


class SummarizeAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        user = request.user
        data = request.data

        if not data:
            return Response(
                {"detail": "Missing article data in request body."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        title = data.get("title") or ""
        url = data.get("url") or ""
        content = data.get("content") or data.get("text") or ""
        description = data.get("description") or data.get("summary") or ""

        # Compose text (metadata + content)
        composed_text = ""
        if title:
            composed_text += f"Title: {title}\n\n"
        if url:
            composed_text += f"URL: {url}\n\n"
        if description:
            composed_text += f"Description: {description}\n\n"
        if content:
            composed_text += f"Content:\n{content}\n"

        # chunk the text if it's large
        try:
            chunks = _chunk_text(
                composed_text, size=CHUNK_CHAR_SIZE, overlap=CHUNK_OVERLAP
            )
            if not chunks:
                return Response(
                    {"detail": "Article has no textual content to summarize."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if len(chunks) == 1:
                # one-shot
                generated_summary = _hf_summarize_via_client(chunks[0])
            else:
                # multi-stage summarization: summarize each chunk, then summarize combined chunk summaries
                chunk_summaries = []
                for ch in chunks:
                    s = _hf_summarize_via_client(ch)
                    chunk_summaries.append(s)
                    time.sleep(HF_CALL_SLEEP)
                combined = "\n\n".join(chunk_summaries)
                generated_summary = _hf_summarize_via_client(combined)
        except RuntimeError as e:
            # map to 502 to indicate upstream (HF) failure
            return Response(
                {"detail": "AI summarization failed", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"detail": "Summarization error", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to MongoDB
        try:
            client, db = _connect_mongo()
            coll_name = getattr(user, "mongo_collection_name", None)
            if not coll_name:
                coll_name = f"user_{user.id}_summaries"
                user.mongo_collection_name = coll_name
                user.save(update_fields=["mongo_collection_name"])

            col = db[coll_name]
            doc = {
                "user_id": user.id,
                "created_at": datetime.utcnow(),
                "article": data,
                "summary": generated_summary,
                "title": title,
                "url": url,
                "image": data.get("image"),
                "publishedAt": data.get("publishedAt"),
                "source": data.get("source"),
            }
            res = col.insert_one(doc)
            saved_id = str(res.inserted_id)
        except Exception as e:
            return Response(
                {"detail": "Failed saving to MongoDB", "error": str(e)},
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
