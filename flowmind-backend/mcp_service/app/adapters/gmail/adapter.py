import base64
import html
import re
from email.message import EmailMessage
from typing import Any, Awaitable, Callable, Dict, Optional

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
        token_data = self._resolve_token_data(user_tokens)

        if action == "read_latest":
            return await self._with_refresh(lambda fresh: self._read_latest(fresh), token_data)
        if action == "send":
            return await self._with_refresh(lambda fresh: self._send_email(inputs, fresh), token_data)
        if action == "label":
            return await self._with_refresh(lambda fresh: self._label_message(inputs, fresh), token_data)
        raise AdapterExecutionError(f"Unsupported Gmail action '{action}'", 400)

    async def _read_latest(self, token: str) -> str:
        messages = await self._request(
            "GET",
            "/users/me/messages",
            token,
            params={"q": "is:unread", "maxResults": 1},
        )
        if not messages.get("messages"):
            raise AdapterExecutionError("No unread Gmail messages found", 404)

        message_id = messages["messages"][0]["id"]
        message = await self._request(
            "GET",
            f"/users/me/messages/{message_id}",
            token,
            params={"format": "full"},
        )
        subject = self._find_header(message, "Subject")
        body = self._extract_message_body(message.get("payload", {}))
        return f"Subject: {subject}\n\n{body}".strip()

    async def _send_email(self, inputs: Dict[str, Any], token: str) -> str:
        to = str(inputs.get("to") or settings.GMAIL_DEFAULT_TO or "").strip()
        subject = str(inputs.get("subject") or settings.GMAIL_DEFAULT_SUBJECT or "").strip()
        body = str(inputs.get("body") or inputs.get("text") or inputs.get("content") or "").strip()
        if not to or not subject or not body:
            raise AdapterExecutionError(
                "Gmail send requires a recipient, subject, and message body.",
                400,
            )

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
        await self._request(
            "POST",
            f"/users/me/messages/{message_id}/modify",
            token,
            json={"addLabelIds": [label_id]},
        )
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
            async with httpx.AsyncClient(
                base_url=self.base_url,
                timeout=settings.MCP_REQUEST_TIMEOUT,
                trust_env=False,
            ) as client:
                response = await client.request(method, path, headers=headers, **kwargs)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"Gmail API error: {detail}", exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise AdapterExecutionError(
                f"Gmail connection failed (DNS/Network). Check your internet or ensure google.com is reachable: {exc}",
                502,
            ) from exc

    @staticmethod
    def _find_header(message: Dict[str, Any], name: str) -> str:
        for header in message.get("payload", {}).get("headers", []):
            if header.get("name", "").lower() == name.lower():
                return header.get("value", "")
        return ""

    @classmethod
    def _extract_message_body(cls, payload: Dict[str, Any]) -> str:
        mime_type = str(payload.get("mimeType", "")).lower()
        body = payload.get("body", {}).get("data")
        if body:
            decoded = cls._decode_body(body)
            return cls._sanitize_body(decoded, mime_type)

        text_candidate = cls._extract_part_body(payload, preferred_mime="text/plain")
        if text_candidate:
            return text_candidate

        html_candidate = cls._extract_part_body(payload, preferred_mime="text/html")
        if html_candidate:
            return html_candidate

        return ""

    @staticmethod
    def _decode_body(data: str) -> str:
        padded = data + "=" * (-len(data) % 4)
        return base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8", errors="ignore")

    @classmethod
    def _extract_part_body(cls, payload: Dict[str, Any], preferred_mime: str) -> str:
        for part in payload.get("parts", []) or []:
            mime_type = str(part.get("mimeType", "")).lower()
            if mime_type == preferred_mime:
                data = part.get("body", {}).get("data")
                if data:
                    return cls._sanitize_body(cls._decode_body(data), mime_type)

            nested = cls._extract_part_body(part, preferred_mime)
            if nested:
                return nested
        return ""

    @classmethod
    def _sanitize_body(cls, content: str, mime_type: str) -> str:
        if "html" not in mime_type:
            return cls._normalize_whitespace(content)

        text = re.sub(r"(?is)<(script|style).*?>.*?</\\1>", " ", content)
        text = re.sub(r"(?i)<br\\s*/?>", "\n", text)
        text = re.sub(r"(?i)</p\\s*>", "\n\n", text)
        text = re.sub(r"(?i)</div\\s*>", "\n", text)
        text = re.sub(r"(?s)<[^>]+>", " ", text)
        text = html.unescape(text)
        return cls._normalize_whitespace(text)

    @staticmethod
    def _normalize_whitespace(content: str) -> str:
        content = content.replace("\r", "")
        content = re.sub(r"\n{3,}", "\n\n", content)
        content = re.sub(r"[ \t]+", " ", content)
        content = re.sub(r" *\n *", "\n", content)
        return content.strip()

    @staticmethod
    def _resolve_token_data(user_tokens: Optional[Dict[str, Dict[str, Any]]]) -> Dict[str, str]:
        access_token = ""
        refresh_token = ""
        if user_tokens:
            gmail_tokens = user_tokens.get("gmail", {})
            access_token = str(gmail_tokens.get("access_token", "")).strip()
            refresh_token = str(gmail_tokens.get("refresh_token", "")).strip()

        access_token = access_token or settings.GMAIL_ACCESS_TOKEN
        refresh_token = refresh_token or settings.GMAIL_REFRESH_TOKEN
        if not access_token:
            raise ConfigurationError("Gmail access token is not configured", 503)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def _with_refresh(
        self,
        operation: Callable[[str], Awaitable[Any]],
        token_data: Dict[str, str],
    ) -> Any:
        try:
            return await operation(token_data["access_token"])
        except AdapterExecutionError as exc:
            if exc.status_code != 401 or not token_data.get("refresh_token"):
                raise
            fresh_token = await self._refresh_access_token(token_data["refresh_token"])
            return await operation(fresh_token)

    async def _refresh_access_token(self, refresh_token: str) -> str:
        if not settings.GMAIL_CLIENT_ID or not settings.GMAIL_CLIENT_SECRET:
            raise ConfigurationError("Gmail OAuth client is not configured for token refresh", 503)

        payload = {
            "client_id": settings.GMAIL_CLIENT_ID,
            "client_secret": settings.GMAIL_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            async with httpx.AsyncClient(
                timeout=settings.MCP_REQUEST_TIMEOUT,
                trust_env=False,
            ) as client:
                response = await client.post("https://oauth2.googleapis.com/token", data=payload)
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text or str(exc)
            raise AdapterExecutionError(f"Gmail token refresh failed: {detail}", exc.response.status_code) from exc
        except httpx.HTTPError as exc:
            raise AdapterExecutionError(f"Gmail token refresh request failed: {exc}", 502) from exc

        access_token = response.json().get("access_token")
        if not access_token:
            raise AdapterExecutionError("Gmail token refresh returned no access token", 502)
        return access_token
