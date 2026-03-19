from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# ✅ Create Mongo Client
client = MongoClient(MONGO_URI)

# ✅ Database
db = client["zenix"]

# ✅ Collections
users_collection = db["users"]
conversations_collection = db["conversations"]