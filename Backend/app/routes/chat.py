from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional

from app.core.security import verify_token
from app.services.ai_service import get_ai_response

router = APIRouter(prefix="/api")


class HistoryTurn(BaseModel):
    role: str       # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryTurn]] = []


@router.post("/chat")
def chat(req: ChatRequest, user=Depends(verify_token)):

    # Convert Pydantic history objects to dictionaries
    history_dicts = [{"role": t.role, "content": t.content} for t in req.history]

    reply = get_ai_response(message=req.message, history=history_dicts)

    return {"reply": reply}