from base64 import b64encode
from datetime import datetime
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_current_user
from app.models.integration import Integration
from app.models.user import User

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

SUPPORTED_SERVICES = ["gmail", "github", "notion"]


class ConnectRequest(BaseModel):
    service: str


class DisconnectRequest(BaseModel):
    service: str


def _build_oauth_state(user_id: str, service: str) -> str:
    payload = {
        "sub": user_id,
        "service": service,
        "purpose": "integration_oauth",
        "iat": int(datetime.utcnow().timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_oauth_state(state: str) -> dict:
    payload = jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("purpose") != "integration_oauth":
        raise JWTError("Invalid integration state")
    return payload


async def _upsert_integration(user_id: str, service: str, **fields):
    integration = await Integration.find_one(
        Integration.user_id == user_id,
        Integration.service == service,
    )
    update_fields = {
        "status": "connected",
        "connected_at": datetime.utcnow(),
        **fields,
    }
    if integration:
        await integration.set(update_fields)
    else:
        integration = Integration(user_id=user_id, service=service, **update_fields)
        await integration.insert()
    return integration


@router.get("/status")
async def get_status(current_user: User = Depends(get_current_user)):
    integrations = await Integration.find(
        Integration.user_id == str(current_user.id)
    ).to_list()

    connected_map = {integration.service: integration for integration in integrations}
    service_labels = {
        "gmail": "Gmail",
        "github": "GitHub",
        "notion": "Notion Workspace",
    }
    return [
        {
            "id": service,
            "name": service_labels.get(service, service.title()),
            "status": connected_map[service].status if service in connected_map else "disconnected",
            "connectedAt": (
                connected_map[service].connected_at.isoformat()
                if service in connected_map and connected_map[service].connected_at
                else None
            ),
        }
        for service in SUPPORTED_SERVICES
    ]


@router.post("/connect")
async def connect_service(
    body: ConnectRequest,
    current_user: User = Depends(get_current_user),
):
    if body.service not in SUPPORTED_SERVICES:
        raise HTTPException(status_code=400, detail=f"Unsupported service: {body.service}")

    user_id = str(current_user.id)
    state = _build_oauth_state(user_id, body.service)

    if body.service == "gmail":
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(status_code=503, detail="Google OAuth client is not configured")

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GMAIL_OAUTH_REDIRECT_URI,
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent",
            "scope": " ".join([
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/gmail.modify",
            ]),
            "state": state,
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return {"success": True, "service": body.service, "authUrl": auth_url}

    if body.service == "github":
        if settings.GITHUB_OAUTH_CLIENT_ID and settings.GITHUB_OAUTH_CLIENT_SECRET:
            params = {
                "client_id": settings.GITHUB_OAUTH_CLIENT_ID,
                "redirect_uri": settings.GITHUB_OAUTH_REDIRECT_URI,
                "scope": "public_repo read:user user:email",
                "state": state,
            }
            auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
            return {"success": True, "service": body.service, "authUrl": auth_url}

        raise HTTPException(status_code=503, detail="GitHub OAuth client is not configured")

    if body.service == "notion":
        if settings.NOTION_OAUTH_CLIENT_ID and settings.NOTION_OAUTH_CLIENT_SECRET:
            params = {
                "client_id": settings.NOTION_OAUTH_CLIENT_ID,
                "response_type": "code",
                "owner": "user",
                "redirect_uri": settings.NOTION_OAUTH_REDIRECT_URI,
                "state": state,
            }
            auth_url = f"https://api.notion.com/v1/oauth/authorize?{urlencode(params)}"
            return {"success": True, "service": body.service, "authUrl": auth_url}

        raise HTTPException(status_code=503, detail="Notion OAuth client is not configured")

    integration = await Integration.find_one(
        Integration.user_id == user_id,
        Integration.service == body.service,
    )
    if integration:
        await integration.set({"status": "connected", "connected_at": datetime.utcnow()})
    else:
        integration = Integration(
            user_id=user_id,
            service=body.service,
            status="connected",
            connected_at=datetime.utcnow(),
        )
        await integration.insert()

    return {"success": True, "service": body.service, "status": "connected"}


@router.get("/gmail/callback")
async def gmail_oauth_callback(code: str, state: str):
    try:
        payload = _decode_oauth_state(state)
        user_id = str(payload["sub"])
    except (JWTError, KeyError) as exc:
        raise HTTPException(status_code=400, detail="Invalid OAuth state") from exc

    token_payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GMAIL_OAUTH_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post("https://oauth2.googleapis.com/token", data=token_payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Google token exchange failed: {exc}") from exc

    token_data = response.json()
    existing = await Integration.find_one(
        Integration.user_id == user_id,
        Integration.service == "gmail",
    )
    refresh_token = token_data.get("refresh_token") or (existing.refresh_token if existing else None)
    await _upsert_integration(
        user_id,
        "gmail",
        access_token=token_data.get("access_token"),
        refresh_token=refresh_token,
    )
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?gmail=connected")


@router.get("/github/callback")
async def github_oauth_callback(code: str, state: str):
    try:
        payload = _decode_oauth_state(state)
        user_id = str(payload["sub"])
    except (JWTError, KeyError) as exc:
        raise HTTPException(status_code=400, detail="Invalid OAuth state") from exc

    token_payload = {
        "client_id": settings.GITHUB_OAUTH_CLIENT_ID,
        "client_secret": settings.GITHUB_OAUTH_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.GITHUB_OAUTH_REDIRECT_URI,
    }

    headers = {"Accept": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post("https://github.com/login/oauth/access_token", data=token_payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"GitHub token exchange failed: {exc}") from exc

    token_data = response.json()
    if not token_data.get("access_token"):
        raise HTTPException(status_code=502, detail=f"GitHub token exchange failed: {token_data}")

    await _upsert_integration(
        user_id,
        "github",
        access_token=token_data.get("access_token"),
        refresh_token=None,
    )
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?github=connected")


@router.get("/notion/callback")
async def notion_oauth_callback(code: str, state: str):
    try:
        payload = _decode_oauth_state(state)
        user_id = str(payload["sub"])
    except (JWTError, KeyError) as exc:
        raise HTTPException(status_code=400, detail="Invalid OAuth state") from exc

    auth_header = b64encode(
        f"{settings.NOTION_OAUTH_CLIENT_ID}:{settings.NOTION_OAUTH_CLIENT_SECRET}".encode("utf-8")
    ).decode("utf-8")
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/json",
    }
    payload_json = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.NOTION_OAUTH_REDIRECT_URI,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post("https://api.notion.com/v1/oauth/token", json=payload_json, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Notion token exchange failed: {exc}") from exc

    token_data = response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=502, detail=f"Notion token exchange failed: {token_data}")

    await _upsert_integration(
        user_id,
        "notion",
        access_token=access_token,
        refresh_token=token_data.get("refresh_token"),
    )
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/integrations?notion=connected")


@router.delete("/disconnect")
async def disconnect_service(
    body: DisconnectRequest,
    current_user: User = Depends(get_current_user),
):
    integration = await Integration.find_one(
        Integration.user_id == str(current_user.id),
        Integration.service == body.service,
    )
    if integration:
        await integration.set({
            "status": "disconnected",
            "connected_at": None,
            "access_token": None,
            "refresh_token": None,
        })

    return {"success": True, "service": body.service, "status": "disconnected"}
