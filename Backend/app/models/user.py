from app.database.mongo import conversations_collection


def save_message(user_email, role, content):

    conversations_collection.insert_one({
        "user_email": user_email,
        "role": role,
        "content": content
    })


def get_history(user_email):

    messages = list(conversations_collection.find({
        "user_email": user_email
    }))

    return [
        {"role": m["role"], "content": m["content"]}
        for m in messages
    ]