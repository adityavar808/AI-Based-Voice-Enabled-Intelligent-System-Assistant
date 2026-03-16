from sqlalchemy.orm import Session
from app.models.conversation import Conversation


def save_message(db: Session, user_email: str, role: str, content: str):
    msg = Conversation(
        user_email=user_email,
        role=role,
        content=content
    )

    db.add(msg)
    db.commit()


def get_history(db: Session, user_email: str):

    messages = db.query(Conversation).filter(
        Conversation.user_email == user_email
    ).all()

    return [
        {"role": m.role, "content": m.content}
        for m in messages
    ]
