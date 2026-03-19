from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_token
from app.services.ai_service import get_ai_response
from app.services.conversation_service import save_message, get_history


router = APIRouter(prefix="/api")


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(req: ChatRequest, user=Depends(verify_token)):

    user_email = user

    history = get_history(user_email)

    reply = get_ai_response(req.message, history)

    save_message(user_email, "user", req.message)
    save_message(user_email, "assistant", reply)

    return {"reply": reply}