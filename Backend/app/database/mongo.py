from flask_pymongo import PyMongo


from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
mongo = PyMongo()

client = MongoClient(MONGO_URI)

db = client["zenix"]

users_collection = db["users"]
conversations_collection = db["conversations"]