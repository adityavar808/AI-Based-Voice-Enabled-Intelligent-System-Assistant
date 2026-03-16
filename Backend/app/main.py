from fastapi import FastAPI
from app.routes import chat, auth
from app.database.db import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "ZENIX FastAPI backend running"}

app.include_router(chat.router)
app.include_router(auth.router)