from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.database import mongo

router = APIRouter(prefix="/api", tags=["Auth"])

_memory_users = {}


class AuthRequest(BaseModel):
    name: str | None = Field(default=None, max_length=60)
    email: str
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None):
        if value is None:
            return None

        normalized = value.strip()
        if not normalized:
            return None

        return normalized

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str):
        normalized = value.strip().lower()
        local, separator, domain = normalized.partition("@")

        if not separator or not local or "." not in domain:
            raise ValueError("Enter a valid email address")

        return normalized


def _fallback_name(email: str):
    local_part = email.split("@", 1)[0].replace(".", " ").replace("_", " ")
    return " ".join(part.capitalize() for part in local_part.split()) or "Zenix User"


def _public_user(document: dict[str, Any] | None, email: str):
    return {
        "email": email,
        "name": (document or {}).get("name") or _fallback_name(email),
    }


def _get_user(email: str):
    normalized_email = email.strip().lower()

    if mongo.users_collection is not None:
        try:
            return mongo.users_collection.find_one({"email": normalized_email})
        except Exception as exc:
            if mongo.MONGO_URI:
                raise HTTPException(
                    status_code=503,
                    detail=f"MongoDB user lookup failed: {exc}",
                ) from exc
            print(f"User lookup failed, using memory fallback: {exc}")

    if mongo.MONGO_URI:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    return _memory_users.get(normalized_email)


def _save_user(email: str, hashed_password: str, name: str | None = None):
    normalized_email = email.strip().lower()
    document = {
        "email": normalized_email,
        "password": hashed_password,
        "name": name or _fallback_name(normalized_email),
    }

    if mongo.users_collection is not None:
        try:
            mongo.users_collection.insert_one(document)
            return
        except Exception as exc:
            if mongo.MONGO_URI:
                raise HTTPException(
                    status_code=503,
                    detail=f"MongoDB user persistence failed: {exc}",
                ) from exc
            print(f"User persistence failed, using memory fallback: {exc}")

    if mongo.MONGO_URI:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    _memory_users[normalized_email] = document


def _build_auth_response(user_document: dict[str, Any] | None, email: str):
    payload = {"sub": email, "email": email}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type": "bearer",
        "user": _public_user(user_document, email),
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: AuthRequest):
    if mongo.MONGO_URI and mongo.users_collection is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    normalized_email = req.email.strip().lower()
    existing_user = _get_user(normalized_email)

    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    _save_user(normalized_email, hash_password(req.password), req.name)
    return _build_auth_response(
        {"email": normalized_email, "name": req.name or _fallback_name(normalized_email)},
        normalized_email,
    )


@router.post("/login")
def login(req: AuthRequest):
    if mongo.MONGO_URI and mongo.users_collection is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    normalized_email = req.email.strip().lower()
    user = _get_user(normalized_email)

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _build_auth_response(user, normalized_email)


@router.get("/me")
def me(user=Depends(verify_token)):
    email = user if isinstance(user, str) else user.get("email") or user.get("sub")
    stored_user = _get_user(email) if email else None
    return _public_user(stored_user, email)
