from pydantic import BaseModel, EmailStr, Field


# ✅ REGISTER SCHEMA
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")


# ✅ LOGIN SCHEMA
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)