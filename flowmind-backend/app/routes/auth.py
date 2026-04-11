"""
auth.py — Authentication routes:
  POST /api/auth/register    → Email + password signup
  POST /api/auth/login       → Email + password login
  POST /api/auth/google      → Google OAuth (ID token from frontend)
  POST /api/auth/refresh     → Refresh JWT
  GET  /api/auth/me          → Get current user info
"""
from fastapi import APIRouter, HTTPException, status, Depends

from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
)
from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_google_token,
    verify_password,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_payload(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
    }


# ─── Register ────────────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        name=body.name,
        password_hash=body.password,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return AuthResponse(jwt=token, user=_user_payload(user))


# ─── Login ───────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = await User.find_one(User.email == body.email)
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return AuthResponse(jwt=token, user=_user_payload(user))


# ─── Google OAuth ─────────────────────────────────────────────────
@router.post("/google", response_model=AuthResponse)
async def google_auth(body: GoogleAuthRequest):
    """
    Receives the Google ID token from the frontend (via Google Identity Services).
    Verifies the token, creates or updates the user, returns a JWT.
    
    Frontend sends this token after the Google Sign-In button is clicked:
      const response = await googleAuth(credential); // credential = Google ID token
    """
    google_info = verify_google_token(body.token)
    if not google_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # Find existing user by google_id or email
    user = await User.find_one(User.google_id == google_info["google_id"])
    if not user:
        user = await User.find_one(User.email == google_info["email"])

    if user:
        # Update Google info if they previously used email/password
        await user.set({
            "google_id": google_info["google_id"],
            "picture": google_info.get("picture"),
            "name": google_info.get("name", user.name),
        })
    else:
        # New user via Google
        user = User(
            email=google_info["email"],
            name=google_info["name"],
            google_id=google_info["google_id"],
            picture=google_info.get("picture"),
        )
        await user.insert()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return AuthResponse(jwt=token, user=_user_payload(user))


# ─── Me ───────────────────────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_payload(current_user)


# ─── Refresh ──────────────────────────────────────────────────────
@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    token = create_access_token({"sub": str(current_user.id), "email": current_user.email})
    return {"jwt": token}
