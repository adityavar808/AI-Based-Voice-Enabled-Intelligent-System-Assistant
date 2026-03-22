import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "").strip()

client = None
db = None
users_collection = None
conversations_collection = None

if MONGO_URI:
    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
            socketTimeoutMS=2000,
        )
        db = client["zenix"]
        users_collection = db["users"]
        conversations_collection = db["conversations"]
    except Exception as exc:
        print(f"MongoDB unavailable, using in-memory fallback: {exc}")
