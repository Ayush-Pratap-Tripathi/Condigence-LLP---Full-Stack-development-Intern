from django.urls import path
from .views import (
    SignupAPIView,
    LoginAPIView,
    ProfileDetail,
    SearchHistoryListCreateView,
    SearchHistoryDeleteView,
    SearchHistoryClearView,
    ReadHistoryListView,
    ReadHistoryDeleteView,
    ReadHistoryClearView,
)
from .views_news import NewsProxyAPIView

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", ProfileDetail.as_view(), name="profile-detail"),
    # history endpoints (authenticated)
    path(
        "history/search/",
        SearchHistoryListCreateView.as_view(),
        name="history-search-list",
    ),
    path(
        "history/search/<int:pk>/",
        SearchHistoryDeleteView.as_view(),
        name="history-search-delete",
    ),
    path(
        "history/search/clear/",
        SearchHistoryClearView.as_view(),
        name="history-search-clear",
    ),
    path("history/read/", ReadHistoryListView.as_view(), name="history-read-list"),
    path(
        "history/read/<int:pk>/",
        ReadHistoryDeleteView.as_view(),
        name="history-read-delete",
    ),
    path(
        "history/read/clear/", ReadHistoryClearView.as_view(), name="history-read-clear"
    ),
    path("news/", NewsProxyAPIView.as_view(), name="news-proxy"),
]
