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
