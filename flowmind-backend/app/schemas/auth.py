from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend


class AuthResponse(BaseModel):
    jwt: str
    user: dict


class TokenRefreshRequest(BaseModel):
    token: str
