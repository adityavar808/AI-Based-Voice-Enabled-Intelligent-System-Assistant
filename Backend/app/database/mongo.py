from pymongo import MongoClient
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# ❗ Safety check
if not MONGO_URI:
    raise Exception("MONGO_URI not found in .env file")

# ✅ Create Mongo Client
client = MongoClient(MONGO_URI)

# ✅ Database
db = client["zenix"]

# ✅ Collections
users_collection = db["users"]
conversations_collection = db["conversations"]