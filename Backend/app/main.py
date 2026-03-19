from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat
from app.routes import auth  # ✅ ADD THIS

from app.database.mongo import mongo

from fastapi_jwt_auth import AuthJWT  # ✅ JWT

# ✅ CREATE APP FIRST
app = FastAPI()

# ✅ INIT MONGO AFTER APP
mongo.init_app(app)

# ✅ RATE LIMITER
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# ✅ JWT CONFIG
class Settings:
    authjwt_secret_key: str = "super-secret-key"  # ⚠️ change in production

@AuthJWT.load_config
def get_config():
    return Settings()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTES
app.include_router(chat.router)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])  # ✅ ADD THIS

# ✅ BASIC ROUTES
@app.get("/")
def home():
    return {"message": "ZENIX FastAPI backend running"}

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "zenix-backend",
        "version": "1.0.0"
    }