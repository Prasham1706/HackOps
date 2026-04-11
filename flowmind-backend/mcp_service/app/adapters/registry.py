from app.adapters.base import ServiceAdapter
from app.adapters.gemini.adapter import GeminiAdapter
from app.adapters.github.adapter import GitHubAdapter
from app.adapters.gmail.adapter import GmailAdapter
from app.adapters.notion.adapter import NotionAdapter

_ADAPTERS = {
    "gemini": GeminiAdapter(),
    "github": GitHubAdapter(),
    "gmail": GmailAdapter(),
    "notion": NotionAdapter(),
}


def get_adapter(service: str) -> ServiceAdapter:
    return _ADAPTERS[service.lower()]

