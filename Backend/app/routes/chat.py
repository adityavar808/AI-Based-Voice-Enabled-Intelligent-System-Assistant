from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.ai_service import get_ai_response

router = APIRouter(prefix="/api")


class HistoryTurn(BaseModel):
    role: str       # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = []   # conversation history from frontend


@router.post("/chat")
def chat(req: ChatRequest):
    # Convert Pydantic models to plain dicts for ai_service
    history_dicts = [{"role": t.role, "content": t.content} for t in req.history]

    reply = get_ai_response(message=req.message, history=history_dicts)

    return {"reply": reply}
