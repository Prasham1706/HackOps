import json
from typing import Any, Dict, List, Optional

import httpx

from app.adapters.base import ServiceAdapter
from app.adapters.gemini.prompts import WORKFLOW_PLANNER_PROMPT
from app.core.config import settings
from app.core.exceptions import AdapterExecutionError


class GeminiAdapter(ServiceAdapter):
    service_name = "gemini"

    async def execute(
        self,
        action: str,
        inputs: Dict[str, Any],
        user_tokens: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Any:
        if action == "summarize":
            text = str(inputs.get("text", "")).strip()
            if not text:
                raise AdapterExecutionError("Gemini summarize requires inputs.text", 400)
            return await self.summarize(text)
        if action == "generate":
            prompt = str(inputs.get("prompt", "")).strip()
            if not prompt:
                raise AdapterExecutionError("Gemini generate requires inputs.prompt", 400)
            return await self.generate(prompt)
        if action == "classify":
            text = str(inputs.get("text", "")).strip()
            if not text:
                raise AdapterExecutionError("Gemini classify requires inputs.text", 400)
            return await self.classify(text)
        raise AdapterExecutionError(f"Unsupported Gemini action '{action}'", 400)

    async def summarize(self, text: str) -> str:
        prompt = f"Summarize the following text in 2-3 sentences:\n\n{text}"
        fallback = text[:280].strip() or "No text to summarize."
        return await self._generate_text(prompt, fallback=fallback)

    async def generate(self, prompt: str) -> str:
        return await self._generate_text(prompt, fallback=f"Generated draft based on prompt: {prompt[:280]}")

    async def classify(self, text: str) -> str:
        fallback = self._heuristic_classify(text)
        prompt = (
            "Classify the following text into one concise label. "
            "Return only the label.\n\n"
            f"{text}"
        )
        return await self._generate_text(prompt, fallback=fallback)

    async def plan_workflow(self, description: str, services: List[str]) -> Optional[Dict[str, Any]]:
        if not settings.GEMINI_API_KEY:
            return None

        prompt = (
            f"{WORKFLOW_PLANNER_PROMPT}\n\n"
            f"Selected services: {services or []}\n"
            f"User request: {description}\n"
        )
        try:
            text = await self._generate_text(prompt, fallback="", require_api=True)
        except AdapterExecutionError:
            return None
        try:
            return self._extract_json_object(text)
        except json.JSONDecodeError:
            return None

    async def _generate_text(self, prompt: str, fallback: str, require_api: bool = False) -> str:
        if not settings.GEMINI_API_KEY:
            return fallback or "Gemini API key not configured."

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        try:
            async with httpx.AsyncClient(timeout=settings.MCP_REQUEST_TIMEOUT) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            if require_api:
                raise AdapterExecutionError(f"Gemini API request failed: {exc}", 502) from exc
            return fallback

        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError, TypeError) as exc:
            if require_api:
                raise AdapterExecutionError("Gemini returned an unexpected response format", 502) from exc
            return fallback

    @staticmethod
    def _heuristic_classify(text: str) -> str:
        lowered = text.lower()
        if any(word in lowered for word in ["bug", "error", "crash", "issue"]):
            return "bug_report"
        if any(word in lowered for word in ["invoice", "payment", "billing"]):
            return "finance"
        if any(word in lowered for word in ["meeting", "calendar", "schedule"]):
            return "meeting"
        return "general"

    @staticmethod
    def _extract_json_object(raw_text: str) -> Dict[str, Any]:
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start == -1 or end == -1 or end < start:
            raise json.JSONDecodeError("No JSON object found", raw_text, 0)
        return json.loads(raw_text[start : end + 1])
