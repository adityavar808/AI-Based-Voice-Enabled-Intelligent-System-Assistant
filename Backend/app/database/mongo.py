import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

raw_uri = os.getenv("MONGO_URI", "").strip()
MONGO_DB = os.getenv("MONGO_DB", "zenix")

client = None
db = None
users_collection = None
conversations_collection = None
mongo_error = None


def fix_mongo_uri(uri: str) -> str:
    """
    Fix MongoDB URI by encoding username/password if they contain special characters.
    """
    try:
        if "@" not in uri or "://" not in uri:
            return uri

        prefix, rest = uri.split("://", 1)

        if "@" not in rest:
            return uri

        creds, host = rest.split("@", 1)

        if ":" not in creds:
            return uri

        username, password = creds.split(":", 1)

        # Encode safely
        username = quote_plus(username)
        password = quote_plus(password)

        return f"{prefix}://{username}:{password}@{host}"

    except Exception:
        return uri  # fallback safely


MONGO_URI = fix_mongo_uri(raw_uri)

if MONGO_URI:
    try:
        client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
            socketTimeoutMS=2000,
        )
        client.admin.command("ping")

        db = client[MONGO_DB]
        users_collection = db["users"]
        conversations_collection = db["conversations"]

        print("✅ MongoDB connected successfully")

    except Exception as exc:
        mongo_error = str(exc)
        client = None
        db = None
        users_collection = None
        conversations_collection = None
        print(f"❌ MongoDB unavailable, using in-memory fallback: {exc}")