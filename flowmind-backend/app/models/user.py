from beanie import Document, Indexed
from pydantic import EmailStr
from typing import Optional
from datetime import datetime


class User(Document):
    email: Indexed(EmailStr, unique=True)
    name: str
    google_id: Optional[str] = None
    password_hash: Optional[str] = None  # None for Google-only users
    picture: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
        indexes = [
            "email",
            "google_id",
        ]
