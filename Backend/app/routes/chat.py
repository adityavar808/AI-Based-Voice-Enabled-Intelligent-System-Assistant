from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import verify_token

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(req: ChatRequest, user = Depends(verify_token)):

    user_message = req.message

    reply = f"You said: {user_message}"

    return {
        "reply": reply
    }