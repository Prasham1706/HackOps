import json
from typing import Any, Dict, Optional

import httpx

from app.adapters.base import ServiceAdapter
from app.core.config import settings
from app.core.exceptions import AdapterExecutionError, ConfigurationError


class NotionAdapter(ServiceAdapter):
    service_name = "notion"
    base_url = "https://api.notion.com/v1"

    async def execute(
        self,
        action: str,
        inputs: Dict[str, Any],
        user_tokens: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Any:
        token = self._resolve_token(user_tokens)

        if action == "create_task":
            return await self._create_task(inputs, token)
        if action == "update_task":
            return await self._update_task(inputs, token)
        if action == "query":
            return await self._query_database(inputs, token)
        raise AdapterExecutionError(f"Unsupported Notion action '{action}'", 400)

    async def _create_task(self, inputs: Dict[str, Any], token: str) -> str:
        database_id = str(inputs.get("database_id") or settings.NOTION_DEFAULT_DATABASE_ID or "").strip()
        title = str(inputs.get("title", "")).strip()
        content = str(inputs.get("content") or inputs.get("text") or "").strip()
        title_property = str(inputs.get("title_property", "Name")).strip() or "Name"
        if not database_id or not title:
            raise AdapterExecutionError(
                "Notion create_task requires inputs.database_id or NOTION_DEFAULT_DATABASE_ID, plus inputs.title",
                400,
            )

        payload = {
            "parent": {"database_id": database_id},
            "properties": {
                title_property: {
                    "title": [{"text": {"content": title}}]
                }
            },
        }
        if content:
            payload["children"] = [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}]
                    },
                }
            ]
        page = await self._request("POST", "/pages", token, json=payload)
        return f"Created Notion page {page['id']}"

    async def _update_task(self, inputs: Dict[str, Any], token: str) -> str:
        page_id = str(inputs.get("page_id", "")).strip()
        properties = inputs.get("properties")
        if not page_id or not isinstance(properties, dict):
            raise AdapterExecutionError("Notion update_task requires inputs.page_id and inputs.properties", 400)
        page = await self._request("PATCH", f"/pages/{page_id}", token, json={"properties": properties})
        return f"Updated Notion page {page['id']}"

    async def _query_database(self, inputs: Dict[str, Any], token: str) -> str:
        database_id = str(inputs.get("database_id") or settings.NOTION_DEFAULT_DATABASE_ID or "").strip()
        if not database_id:
            raise AdapterExecutionError("Notion query requires inputs.database_id or NOTION_DEFAULT_DATABASE_ID", 400)
        payload = {}
        if isinstance(inputs.get("filter"), dict):
            payload["filter"] = inputs["filter"]
        if isinstance(inputs.get("sorts"), list):
            payload["sorts"] = inputs["sorts"]
        result = await self._request("POST", f"/databases/{database_id}/query", token, json=payload)
        return json.dumps(result)

    async def _request(self, method: str, path: str, token: str, **kwargs: Any) -> Any:
        headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": settings.NOTION_VERSION,
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(base_url=self.base_url, timeout=settings.MCP_REQUEST_TIMEOUT) as client:
                response = await client.request(method, path, headers=headers, **kwargs)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"Notion API error: {detail}", exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise AdapterExecutionError(f"Notion API request failed: {exc}", 502) from exc

    @staticmethod
    def _resolve_token(user_tokens: Optional[Dict[str, Dict[str, Any]]]) -> str:
        token = ""
        if user_tokens:
            token = str(user_tokens.get("notion", {}).get("access_token", "")).strip()
        token = token or settings.NOTION_API_KEY
        if not token:
            raise ConfigurationError("Notion API key is not configured", 503)
        return token
