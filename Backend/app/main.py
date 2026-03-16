from fastapi import FastAPI
from app.routes import chat, auth

app = FastAPI()


@app.get("/")
def root():
    return {"message": "ZENIX FastAPI backend running"}


app.include_router(chat.router)
app.include_router(auth.router)