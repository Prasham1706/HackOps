from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.models.user import User
from app.models.integration import Integration

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

SUPPORTED_SERVICES = ["gmail", "github", "notion", "drive"]


class ConnectRequest(BaseModel):
    service: str


class DisconnectRequest(BaseModel):
    service: str


@router.get("/status")
async def get_status(current_user: User = Depends(get_current_user)):
    """Return connection status for all services for the current user."""
    integrations = await Integration.find(
        Integration.user_id == str(current_user.id)
    ).to_list()

    connected_map = {i.service: i for i in integrations}

    result = []
    service_labels = {
        "gmail": "Gmail",
        "github": "GitHub",
        "notion": "Notion Workspace",
        "drive": "Google Drive",
    }
    for svc in SUPPORTED_SERVICES:
        integration = connected_map.get(svc)
        result.append({
            "id": svc,
            "name": service_labels.get(svc, svc.title()),
            "status": integration.status if integration else "disconnected",
            "connectedAt": integration.connected_at.isoformat() if integration and integration.connected_at else None,
        })
    return result


@router.post("/connect")
async def connect_service(
    body: ConnectRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Stub endpoint for OAuth connection.
    In production this would redirect to the service's OAuth flow.
    For now it marks the service as 'connected' in MongoDB.
    """
    if body.service not in SUPPORTED_SERVICES:
        raise HTTPException(status_code=400, detail=f"Unsupported service: {body.service}")

    integration = await Integration.find_one(
        Integration.user_id == str(current_user.id),
        Integration.service == body.service,
    )

    if integration:
        await integration.set({"status": "connected", "connected_at": datetime.utcnow()})
    else:
        integration = Integration(
            user_id=str(current_user.id),
            service=body.service,
            status="connected",
            connected_at=datetime.utcnow(),
        )
        await integration.insert()

    return {"success": True, "service": body.service, "status": "connected"}


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
        await integration.set({"status": "disconnected", "connected_at": None})

    return {"success": True, "service": body.service, "status": "disconnected"}
