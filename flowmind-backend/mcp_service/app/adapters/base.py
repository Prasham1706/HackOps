from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class ServiceAdapter(ABC):
    service_name: str

    @abstractmethod
    async def execute(
        self,
        action: str,
        inputs: Dict[str, Any],
        user_tokens: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Any:
        raise NotImplementedError

