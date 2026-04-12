from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database.mongo import (
    MONGO_URI,
    conversations_collection,
    mongo_error,
    users_collection,
)
from app.routes import auth, chat

# initialize fastAPI
app = FastAPI(title="ZENIX Backend")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(auth.router)


@app.get("/")
def home():
    return {"message": "ZENIX FastAPI backend running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "zenix-backend",
        "version": "1.0.0",
        "mongo_configured": bool(MONGO_URI),
        "mongo_ready": conversations_collection is not None
        and users_collection is not None,
        "mongo_error": mongo_error,
    }
