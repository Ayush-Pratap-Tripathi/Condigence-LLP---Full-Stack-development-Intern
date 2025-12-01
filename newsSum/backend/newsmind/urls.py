from django.urls import path
from .views import SignupAPIView, LoginAPIView, ProfileDetail

urlpatterns = [
    path("signup/", SignupAPIView.as_view(), name="signup"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("profile/", ProfileDetail.as_view(), name="profile-detail"),
]
