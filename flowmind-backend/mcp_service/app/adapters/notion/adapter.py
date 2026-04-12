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
        if action in {"query", "listen_database"}:
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
                    "title": [{"text": {"content": title}}],
                }
            },
        }
        if content:
            payload["children"] = [
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}],
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

        payload: Dict[str, Any] = {}
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
            return await self._send_request(method, path, headers=headers, trust_env=False, **kwargs)
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"Notion API error: {detail}", exc.response.status_code) from exc
        except (httpx.HTTPError, httpx.ConnectError):
            try:
                return await self._send_request(method, path, headers=headers, trust_env=True, **kwargs)
            except httpx.HTTPStatusError as retry_exc:
                detail = retry_exc.response.text or str(retry_exc)
                raise AdapterExecutionError(f"Notion API error: {detail}", retry_exc.response.status_code) from retry_exc
            except (httpx.HTTPError, httpx.ConnectError) as retry_exc:
                raise AdapterExecutionError(
                    "Notion connection failed (DNS/Network). This is likely a local DNS issue. "
                    "Try restarting your router or switching to Google DNS (8.8.8.8): "
                    f"{retry_exc}",
                    502,
                ) from retry_exc

    async def _send_request(
        self,
        method: str,
        path: str,
        headers: Dict[str, str],
        trust_env: bool,
        **kwargs: Any,
    ) -> Any:
        async with httpx.AsyncClient(
            base_url=self.base_url,
            timeout=settings.MCP_REQUEST_TIMEOUT,
            trust_env=trust_env,
        ) as client:
            response = await client.request(method, path, headers=headers, **kwargs)
            response.raise_for_status()
            return response.json()

    @staticmethod
    def _resolve_token(user_tokens: Optional[Dict[str, Dict[str, Any]]]) -> str:
        token = ""
        if user_tokens:
            token = str(user_tokens.get("notion", {}).get("access_token", "")).strip()
        token = token or settings.NOTION_API_KEY
        if not token:
            raise ConfigurationError("Notion API key is not configured", 503)
        return token
