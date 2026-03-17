from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from secure import Secure

from app.routes import chat, auth

app = FastAPI(title="ZENIX AI Backend")

# ---------------- CORS ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- SECURITY HEADERS ---------------- #
secure_headers = Secure()

@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
    response = await call_next(request)

    for header, value in secure_headers.headers.items():
        response.headers[header] = value

    return response

# ---------------- ROUTES ---------------- #
app.include_router(auth.router)
app.include_router(chat.router)

# ---------------- ROOT ---------------- #
@app.get("/")
def root():
    return {"message": "ZENIX FastAPI backend running"}