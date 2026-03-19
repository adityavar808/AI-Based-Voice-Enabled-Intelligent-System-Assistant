from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def login_schema(data):
    return {
        "email": data.get("email"),
        "password": data.get("password")
    }