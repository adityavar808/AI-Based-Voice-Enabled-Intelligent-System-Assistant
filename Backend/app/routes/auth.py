from fastapi import APIRouter, HTTPException, Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import jwt

from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM
)

from app.database.mongo import users_collection


router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address)


@router.post("/register")
def register(user: RegisterRequest):

    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password
    })

    return {"message": "User registered successfully"}


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, response: Response, user: LoginRequest):

    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": db_user["email"]})
    refresh_token = create_refresh_token({"sub": db_user["email"]})

    response.set_cookie("access_token", access_token, httponly=True, samesite="Strict")
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Strict")

    return {
    "message": "Login successful"
}


@router.post("/refresh")
def refresh(refresh_token: str):

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])

        new_access = create_access_token({"sub": payload["sub"]})

        return {"access_token": new_access}

    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout")
def logout(response: Response):

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return {"message": "Logged out"}