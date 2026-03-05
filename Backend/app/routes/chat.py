from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(req: ChatRequest):
    user_message = req.message

    reply = f"You said: {user_message}"

    return {
        "reply": reply
    }