from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class GenomeSchema(BaseModel):
    genomeId: str
    name: str
    services: List[str]
    fitnessScore: float
    runCount: int
    lastRun: Optional[str] = None


class CloneGenomeRequest(BaseModel):
    genomeId: str
