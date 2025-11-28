from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("MONGO_URI not set in environment")

_client = MongoClient(MONGO_URI)
db = _client["newssum_mongo"]  # name of Mongo DB (you can change)
