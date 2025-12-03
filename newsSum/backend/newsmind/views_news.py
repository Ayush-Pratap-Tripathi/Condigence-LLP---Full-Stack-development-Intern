# backend/newsmind/views_news.py
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

# Cache the endpoint for 5 minutes to reduce calls to upstream
CACHE_SECONDS = 60 * 5


@method_decorator(cache_page(CACHE_SECONDS), name="dispatch")
class NewsProxyAPIView(APIView):
    """
    GET /api/news/?q=&category=&country=&lang=&max=&page=
    Proxies to GNews top-headlines or search endpoint depending on presence of `q`.
    """

    permission_classes = [permissions.IsAuthenticated]  # require login

    def get(self, request):
        api_key = getattr(settings, "GNEWS_API_KEY", "")
        if not api_key:
            return Response(
                {"detail": "News provider key not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        q = request.GET.get("q", "").strip()
        category = request.GET.get("category")
        country = request.GET.get("country")
        lang = request.GET.get("lang")
        max_results = request.GET.get("max", request.GET.get("pageSize", 12))
        page = request.GET.get("page", 1)
        sortby = request.GET.get("sortby")  # optional

        if q:
            endpoint = "https://gnews.io/api/v4/search?q=Google&lang=en&max=5&apikey="
        else:
            endpoint = "https://gnews.io/api/v4/search?q=Google&lang=en&max=5&apikey="

        params = {
            "apikey": api_key,
            "max": max_results,
            "page": page,
        }
        if lang:
            params["lang"] = lang
        if category and not q:
            params["category"] = category
        if country:
            params["country"] = country
        if q:
            params["q"] = q
        if sortby:
            params["sortby"] = sortby

        try:
            r = requests.get(endpoint, params=params, timeout=8)
            r.raise_for_status()
        except requests.RequestException as e:
            return Response(
                {"detail": "Upstream error contacting GNews", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = r.json()
        upstream_articles = data.get("articles", [])

        # Normalise shape for frontend
        articles = []
        for i, a in enumerate(upstream_articles):
            # GNews returns keys like title, description, content, image, publishedAt, source:{name}
            source_name = None
            if isinstance(a.get("source"), dict):
                source_name = a["source"].get("name")
            else:
                source_name = a.get("source")
            # Use url as unique id if available
            art_id = a.get("url") or f"{a.get('title')[:60]}_{i}"
            articles.append(
                {
                    "id": art_id,
                    "title": a.get("title"),
                    "description": a.get("description"),
                    "content": a.get("content") or a.get("description"),
                    "image": a.get("image"),
                    "publishedAt": a.get("publishedAt"),
                    "source": source_name,
                    "raw": a,
                }
            )

        return Response(
            {"total": data.get("totalArticles", len(articles)), "articles": articles}
        )
