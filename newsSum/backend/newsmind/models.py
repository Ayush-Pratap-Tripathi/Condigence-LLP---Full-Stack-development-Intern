from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # username, password, email already provided by AbstractUser
    # Add the mongo collection name field
    mongo_collection_name = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.username
