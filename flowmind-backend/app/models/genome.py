from beanie import Document
from typing import List, Optional, Dict, Any
from datetime import datetime


class Genome(Document):
    user_id: str
    workflow_id: str
    name: str
    services: List[str] = []
    fingerprint: Optional[Dict[str, Any]] = None  # step order, params, etc.
    fitness_score: float = 0.0
    run_count: int = 1
    last_run: datetime = datetime.utcnow()
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "genomes"
        indexes = ["user_id", "workflow_id"]
