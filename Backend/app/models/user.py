from app.database.mongo import users_collection
from app.core.security import hash_password


def create_user(email: str, password: str, name: str):
    user = {
        "email": email.strip().lower(),
        "password": hash_password(password),
        "name": name,
    }
    users_collection.insert_one(user)
    return user


def find_user_by_email(email: str):
    return users_collection.find_one({"email": email.strip().lower()})


def user_exists(email: str) -> bool:
    return find_user_by_email(email) is not None