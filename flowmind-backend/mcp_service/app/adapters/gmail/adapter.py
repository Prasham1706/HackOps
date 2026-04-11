import base64
from email.message import EmailMessage
from typing import Any, Dict, Optional

import httpx

from app.adapters.base import ServiceAdapter
from app.core.config import settings
from app.core.exceptions import AdapterExecutionError, ConfigurationError


class GmailAdapter(ServiceAdapter):
    service_name = "gmail"
    base_url = "https://gmail.googleapis.com/gmail/v1"

    async def execute(
        self,
        action: str,
        inputs: Dict[str, Any],
        user_tokens: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Any:
        token = self._resolve_token(user_tokens)

        if action == "read_latest":
            return await self._read_latest(token)
        if action == "send":
            return await self._send_email(inputs, token)
        if action == "label":
            return await self._label_message(inputs, token)
        raise AdapterExecutionError(f"Unsupported Gmail action '{action}'", 400)

    async def _read_latest(self, token: str) -> str:
        messages = await self._request("GET", "/users/me/messages", token, params={
            "q": "is:unread",
            "maxResults": 1,
        })
        if not messages.get("messages"):
            raise AdapterExecutionError("No unread Gmail messages found", 404)
        message_id = messages["messages"][0]["id"]
        message = await self._request("GET", f"/users/me/messages/{message_id}", token, params={"format": "full"})
        subject = self._find_header(message, "Subject")
        body = self._extract_message_body(message.get("payload", {}))
        return f"Subject: {subject}\n\n{body}".strip()

    async def _send_email(self, inputs: Dict[str, Any], token: str) -> str:
        to = str(inputs.get("to", "")).strip()
        subject = str(inputs.get("subject", "")).strip()
        body = str(inputs.get("body", "")).strip()
        if not to or not subject or not body:
            raise AdapterExecutionError("Gmail send requires inputs.to, inputs.subject, and inputs.body", 400)

        message = EmailMessage()
        message["To"] = to
        message["Subject"] = subject
        message.set_content(body)
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

        sent = await self._request("POST", "/users/me/messages/send", token, json={"raw": raw})
        return f"Sent Gmail message {sent['id']} to {to}"

    async def _label_message(self, inputs: Dict[str, Any], token: str) -> str:
        message_id = str(inputs.get("message_id", "")).strip()
        label = str(inputs.get("label", "")).strip()
        if not message_id or not label:
            raise AdapterExecutionError("Gmail label requires inputs.message_id and inputs.label", 400)

        label_id = await self._resolve_label_id(label, token)
        await self._request("POST", f"/users/me/messages/{message_id}/modify", token, json={
            "addLabelIds": [label_id],
        })
        return f"Applied label '{label}' to Gmail message {message_id}"

    async def _resolve_label_id(self, label: str, token: str) -> str:
        labels = await self._request("GET", "/users/me/labels", token)
        for item in labels.get("labels", []):
            if item.get("id") == label or item.get("name", "").lower() == label.lower():
                return item["id"]
        raise AdapterExecutionError(f"Gmail label '{label}' not found", 404)

    async def _request(self, method: str, path: str, token: str, **kwargs: Any) -> Any:
        headers = {"Authorization": f"Bearer {token}"}
        try:
            async with httpx.AsyncClient(base_url=self.base_url, timeout=settings.MCP_REQUEST_TIMEOUT) as client:
                response = await client.request(method, path, headers=headers, **kwargs)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"Gmail API error: {detail}", exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise AdapterExecutionError(f"Gmail API request failed: {exc}", 502) from exc

    @staticmethod
    def _find_header(message: Dict[str, Any], name: str) -> str:
        for header in message.get("payload", {}).get("headers", []):
            if header.get("name", "").lower() == name.lower():
                return header.get("value", "")
        return ""

    @classmethod
    def _extract_message_body(cls, payload: Dict[str, Any]) -> str:
        body = payload.get("body", {}).get("data")
        if body:
            return cls._decode_body(body)
        for part in payload.get("parts", []) or []:
            data = part.get("body", {}).get("data")
            if data:
                return cls._decode_body(data)
        return ""

    @staticmethod
    def _decode_body(data: str) -> str:
        padded = data + "=" * (-len(data) % 4)
        return base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8", errors="ignore")

    @staticmethod
    def _resolve_token(user_tokens: Optional[Dict[str, Dict[str, Any]]]) -> str:
        token = ""
        if user_tokens:
            token = str(user_tokens.get("gmail", {}).get("access_token", "")).strip()
        token = token or settings.GMAIL_ACCESS_TOKEN
        if not token:
            raise ConfigurationError("Gmail access token is not configured", 503)
        return token

