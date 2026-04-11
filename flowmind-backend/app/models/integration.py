from beanie import Document
from typing import Optional
from datetime import datetime


class Integration(Document):
    user_id: str
    service: str  # gmail | github | notion | drive
    access_token: Optional[str] = None   # encrypted
    refresh_token: Optional[str] = None  # encrypted
    status: str = "disconnected"  # connected | disconnected
    connected_at: Optional[datetime] = None

    class Settings:
        name = "integrations"
        indexes = [
            [("user_id", 1), ("service", 1)],  # compound unique
        ]
