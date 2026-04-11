"""
auth_service.py — Handles:
- Password hashing / verification (bcrypt via passlib)
- JWT creation and verification
- Google ID token verification via google-auth
"""
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ─── Password hashing ───────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT ────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None


# ─── Google OAuth ────────────────────────────────────────────────
def verify_google_token(google_id_token: str) -> Optional[dict]:
    """
    Verifies a Google ID token received from the frontend.
    Returns the token payload (sub, email, name, picture) on success,
    or None on failure.

    To get a Google Client ID:
    1. Go to https://console.cloud.google.com/
    2. Create a project → APIs & Services → Credentials
    3. Create OAuth 2.0 Client ID → Web application
    4. Add http://localhost:5173 to Authorized JavaScript Origins
    5. Copy the Client ID and paste into GOOGLE_CLIENT_ID in .env
    """
    if not settings.GOOGLE_CLIENT_ID:
        logger.error("GOOGLE_CLIENT_ID not configured in .env")
        return None

    try:
        idinfo = id_token.verify_oauth2_token(
            google_id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        return {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture", ""),
        }
    except ValueError as e:
        logger.warning(f"Google token verification failed: {e}")
        return None
