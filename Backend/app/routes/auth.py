from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api")

# temporary memory database
users_db = {}


@router.post("/register")
def register(user: RegisterRequest):

    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    users_db[user.email] = hashed_password

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: LoginRequest):

    if user.email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    stored_password = users_db[user.email]

    if not verify_password(user.password, stored_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {"access_token": token}