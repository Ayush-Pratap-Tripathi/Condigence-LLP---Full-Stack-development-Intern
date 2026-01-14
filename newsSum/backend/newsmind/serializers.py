from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def validate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create(username=username, email=email)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(allow_null=True, required=False)
    # computed read-only full name (frontend can use this)
    name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "avatar",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")

    def get_name(self, obj):
        # combine first and last name (trim extra spaces)
        parts = [
            p
            for p in (obj.first_name or "").strip().split()
            + (obj.last_name or "").strip().split()
            if p
        ]
        return " ".join(parts).strip()

    def validate_username(self, value):
        request_user = self.context["request"].user
        if User.objects.filter(username=value).exclude(pk=request_user.pk).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        request_user = self.context["request"].user
        if User.objects.filter(email=value).exclude(pk=request_user.pk).exists():
            raise serializers.ValidationError(
                "This email is already used by another account."
            )
        return value

