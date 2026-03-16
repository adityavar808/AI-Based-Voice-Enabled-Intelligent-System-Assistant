from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.security import verify_token
from app.database.db import get_db
from app.services.ai_service import get_ai_response
from app.services.conversation_service import save_message, get_history


router = APIRouter(prefix="/api")


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(req: ChatRequest, user=Depends(verify_token), db: Session = Depends(get_db)):

    history = get_history(db, user)

    reply = get_ai_response(
        message=req.message,
        history=history
    )

    save_message(db, user, "user", req.message)
    save_message(db, user, "assistant", reply)

    return {"reply": reply}
