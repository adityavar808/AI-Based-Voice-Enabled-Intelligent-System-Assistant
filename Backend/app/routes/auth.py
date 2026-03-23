from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.database.mongo import MONGO_URI, users_collection

router = APIRouter(prefix="/api", tags=["Auth"])

_memory_users = {}


class AuthRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str):
        normalized = value.strip().lower()
        local, separator, domain = normalized.partition("@")

        if not separator or not local or "." not in domain:
            raise ValueError("Enter a valid email address")

        return normalized


def _get_user(email: str):
    normalized_email = email.strip().lower()

    if users_collection is not None:
        try:
            return users_collection.find_one({"email": normalized_email})
        except Exception as exc:
            if MONGO_URI:
                raise HTTPException(
                    status_code=503,
                    detail=f"MongoDB user lookup failed: {exc}",
                ) from exc
            print(f"User lookup failed, using memory fallback: {exc}")

    if MONGO_URI:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    return _memory_users.get(normalized_email)


def _save_user(email: str, hashed_password: str):
    normalized_email = email.strip().lower()
    document = {"email": normalized_email, "password": hashed_password}

    if users_collection is not None:
        try:
            users_collection.insert_one(document)
            return
        except Exception as exc:
            if MONGO_URI:
                raise HTTPException(
                    status_code=503,
                    detail=f"MongoDB user persistence failed: {exc}",
                ) from exc
            print(f"User persistence failed, using memory fallback: {exc}")

    if MONGO_URI:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    _memory_users[normalized_email] = document


def _build_auth_response(email: str):
    payload = {"sub": email, "email": email}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type": "bearer",
        "user": {"email": email},
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: AuthRequest):
    if MONGO_URI and users_collection is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    normalized_email = req.email.strip().lower()
    existing_user = _get_user(normalized_email)

    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    _save_user(normalized_email, hash_password(req.password))
    return _build_auth_response(normalized_email)


@router.post("/login")
def login(req: AuthRequest):
    if MONGO_URI and users_collection is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB is configured but unavailable. Check Atlas URI/network access.",
        )

    normalized_email = req.email.strip().lower()
    user = _get_user(normalized_email)

    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _build_auth_response(normalized_email)


@router.get("/me")
def me(user=Depends(verify_token)):
    email = user if isinstance(user, str) else user.get("email") or user.get("sub")
    return {"email": email}
