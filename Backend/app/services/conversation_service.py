from collections import defaultdict

from app.database.mongo import conversations_collection

_memory_conversations = defaultdict(list)


def _normalize_user_email(user_email):
    if isinstance(user_email, dict):
        return user_email.get("email") or user_email.get("sub") or "guest@local"
    if isinstance(user_email, str) and user_email.strip():
        return user_email.strip()
    return "guest@local"


def save_message(user_email, role, content):
    normalized_user_email = _normalize_user_email(user_email)
    document = {
        "user_email": normalized_user_email,
        "role": role,
        "content": content,
    }

    if conversations_collection is not None:
        try:
            conversations_collection.insert_one(document)
            return
        except Exception as exc:
            print(f"Conversation persistence failed, falling back to memory: {exc}")

    _memory_conversations[normalized_user_email].append(
        {"role": role, "content": content}
    )


def get_history(user_email):
    normalized_user_email = _normalize_user_email(user_email)

    if conversations_collection is not None:
        try:
            messages = list(
                conversations_collection.find(
                    {"user_email": normalized_user_email},
                    {"_id": 0, "role": 1, "content": 1},
                )
            )
            return [
                {"role": message["role"], "content": message["content"]}
                for message in messages
            ]
        except Exception as exc:
            print(f"Conversation history lookup failed, using memory fallback: {exc}")

    return list(_memory_conversations[normalized_user_email])
