import requests
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from urllib.parse import urlparse

CACHE_SECONDS = 60 * 5  # 5 minutes cache


@method_decorator(cache_page(CACHE_SECONDS), name="dispatch")
class WorldNewsProxyAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # keep authentication if desired

    def get(self, request):
        api_key = getattr(settings, "WORLDNEWS_API_KEY", "")
        if not api_key:
            return Response(
                {"detail": "WorldNews API key not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build today's date in YYYY-MM-DD (server timezone)
        today = (
            timezone.localtime(timezone.now()).date().isoformat()
        )  # e.g. '2025-12-04'
        # You can optionally allow client to override date via query param (for debugging)
        date_param = request.GET.get("date", today)

        # allow country/language override but default to us/en
        country = request.GET.get("source-country", "us")
        language = request.GET.get("language", "en")

        endpoint = "https://api.worldnewsapi.com/top-news"
        params = {
            "source-country": country,
            "language": language,
            "date": date_param,
        }

        headers = {"x-api-key": api_key}

        try:
            resp = requests.get(endpoint, params=params, headers=headers, timeout=10)
            resp.raise_for_status()
        except requests.RequestException as e:
            return Response(
                {"detail": "Failed contacting WorldNewsAPI", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = resp.json()

        # data expected structure: {"top_news":[ {"news":[ {...}, {...} ]}, ... ], "language":"en","country":"us"}
        top_news = data.get("top_news") or []
        normalized = []

        # flatten and normalize
        for group in top_news:
            news_list = group.get("news", []) or []
            for item in news_list:
                # fields in provider: id, title, text, summary, url, image, publish_date, author, authors, language, source_country, sentiment
                art_id = item.get("id") or item.get("url") or item.get("title")[:80]
                title = item.get("title")
                # prefer `text` for full content; fallback to `summary`
                content = item.get("text") or item.get("summary") or ""
                description = (
                    item.get("summary") or (content[:300] + "...") if content else ""
                )
                image = item.get("image")
                publishedAt = None
                if item.get("publish_date"):
                    # provider returns 'YYYY-MM-DD HH:MM:SS' — keep as ISO-ish
                    publishedAt = item.get("publish_date")
                source_name = None
                # try parse source from url host if provided
                url = item.get("url")
                if url:
                    try:
                        parsed = urlparse(url)
                        source_name = parsed.hostname
                    except Exception:
                        source_name = None
                # also fallback to author or source_country
                if not source_name:
                    if item.get("author"):
                        source_name = item.get("author")
                    else:
                        source_name = item.get("source_country")

                normalized.append(
                    {
                        "id": art_id,
                        "title": title,
                        "description": description,
                        "content": content,
                        "url": url,
                        "image": image,
                        "publishedAt": publishedAt,
                        "source": source_name,
                        "raw": item,
                    }
                )

        # deduplicate by URL and Title
        seen_urls = set()
        deduped = []
        for art in normalized:
            url = art.get("url")
            if url:
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                deduped.append(art)
            else:
                deduped.append(art)

        seen_titles = set()
        final_articles = []
        for art in deduped:
            title = (art.get("title") or "").strip().lower()
            if title in seen_titles:
                continue
            seen_titles.add(title)
            final_articles.append(art)

        return Response(
            {
                "total": len(final_articles),
                "articles": final_articles,
            }
        )
