from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # make email unique to enforce uniqueness at DB level
    email = models.EmailField(unique=True)
    mongo_collection_name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.username
