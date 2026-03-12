from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_service import get_ai_response

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(req: ChatRequest):

    user_message = req.message

    reply = get_ai_response(user_message)

    return {
        "reply": reply
    }