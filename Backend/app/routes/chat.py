from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.security import get_optional_user, verify_token
from app.services.ai_service import get_ai_response
from app.services.conversation_service import get_history, save_message

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatHistoryItem] = Field(default_factory=list)


@router.post("/chat")
def chat(req: ChatRequest, user=Depends(get_optional_user)):
    persisted_history = get_history(user) if user else []
    history = [entry.model_dump() for entry in req.history] or persisted_history
    reply = get_ai_response(req.message, history)

    if user:
        save_message(user, "user", req.message)
        save_message(user, "assistant", reply)

    return {"reply": reply}


@router.get("/history")
def history(user=Depends(verify_token), limit: int = Query(default=40, ge=1, le=200)):
    messages = get_history(user)
    return {"items": messages[-limit:]}
