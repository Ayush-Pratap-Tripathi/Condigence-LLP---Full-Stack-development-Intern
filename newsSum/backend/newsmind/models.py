from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# Use the actual model class (not a string constant) for FK relationships:
User = settings.AUTH_USER_MODEL


class CustomUser(AbstractUser):
    # make email unique to enforce uniqueness at DB level
    email = models.EmailField(unique=True)
    mongo_collection_name = models.CharField(max_length=255, null=True, blank=True)

    # avatar moved here (store image path)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    def __str__(self):
        return self.username


class SearchHistory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="search_histories"
    )
    query = models.CharField(max_length=512)
    filters = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}: {self.query} @ {self.created_at}"


class ReadHistory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="read_histories"
    )
    article_id = models.CharField(max_length=255)
    article_meta = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}: read {self.article_id} @ {self.created_at}"
