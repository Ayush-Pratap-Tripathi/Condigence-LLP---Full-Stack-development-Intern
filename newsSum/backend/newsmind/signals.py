from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser
from .mongo_client import db


@receiver(post_save, sender=CustomUser)
def create_mongo_collection_for_user(sender, instance, created, **kwargs):
    """
    When a new CustomUser is created, create a MongoDB collection named:
      summaries_user_<user_id>
    and save the collection name into instance.mongo_collection_name (if not set).
    """
    if created:
        collection_name = f"summaries_user_{instance.id}"
        # create collection (MongoDB will create on first insert, but create explicitly to be sure)
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
        # update the user record if not already set
        if instance.mongo_collection_name != collection_name:
            instance.mongo_collection_name = collection_name
            # avoid recursion by saving only this field
            CustomUser.objects.filter(pk=instance.pk).update(
                mongo_collection_name=collection_name
            )
