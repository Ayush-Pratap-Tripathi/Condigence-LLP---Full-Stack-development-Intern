from django.urls import path
from .views import (
    SignupAPIView,
    LoginAPIView,
    ProfileDetail,
)
from .views_news import WorldNewsProxyAPIView
from .views_summarize import SummarizeAPIView

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", ProfileDetail.as_view(), name="profile-detail"),
    path("news/", WorldNewsProxyAPIView.as_view(), name="news-proxy"),
    path("summarize/", SummarizeAPIView.as_view(), name="summarize"),
]
