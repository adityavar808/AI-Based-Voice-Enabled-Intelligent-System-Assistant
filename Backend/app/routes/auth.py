from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session

from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.database.db import get_db
from app.models.user import User

router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")

@router.post("/refresh")
def refresh(request: Request, token: str):

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    new_access = create_access_token({
        "sub": payload["sub"]
    })

    return {"access_token": new_access}


@router.post("/logout")
def logout():
    return {"message": "Logged out"}
@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    new_user = User(
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user.email})
    refresh_token = create_refresh_token({"sub": db_user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
}
