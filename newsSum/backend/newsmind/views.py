from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import SignupSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

User = get_user_model()


class LoginAPIView(APIView):
    """
    POST: login with email & password, returns access & refresh tokens
    Expected payload:
    {
      "email": "user@example.com",
      "password": "password123"
    }
    """

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"detail": "Provide email and password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "mongo_collection_name": user.mongo_collection_name,
        }

        return Response(
            {
                "access": access_token,
                "refresh": refresh_token,
                "user": user_data,
                "expires_in_days": 30,
            },
            status=status.HTTP_200_OK,
        )


class SignupAPIView(APIView):
    """
    POST: create a new user
    Expected payload:
    {
      "username": "ayush",
      "email": "ayush@example.com",
      "password": "secret123",
      "password2": "secret123"
    }
    """

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Return a minimal public representation
            return Response(
                {
                    "message": "User created successfully.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        # serializer errors are returned with field-specific messages
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        user = request.user

        # Support explicit avatar removal flag (frontend: remove_avatar=true)
        remove_avatar = request.data.get("remove_avatar")
        if remove_avatar in ["1", "true", "True", True]:
            if user.avatar:
                user.avatar.delete(save=True)

        serializer = UserProfileSerializer(
            user, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        # if want to remove media file before deletion
        if user.avatar:
            user.avatar.delete(save=False)
        user.delete()
        return Response(
            {"detail": "Account deleted."}, status=status.HTTP_204_NO_CONTENT
        )
