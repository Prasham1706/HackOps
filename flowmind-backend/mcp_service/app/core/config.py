from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GITHUB_TOKEN: str = ""
    GITHUB_DEFAULT_REPO: str = ""
    GMAIL_ACCESS_TOKEN: str = ""
    GMAIL_REFRESH_TOKEN: str = ""
    GMAIL_DEFAULT_TO: str = ""
    GMAIL_DEFAULT_SUBJECT: str = "FlowMind Automation Result"
    GMAIL_CLIENT_ID: str = ""
    GMAIL_CLIENT_SECRET: str = ""
    NOTION_API_KEY: str = ""
    NOTION_DEFAULT_DATABASE_ID: str = ""
    NOTION_VERSION: str = "2022-06-28"
    MCP_REQUEST_TIMEOUT: int = 30
    MCP_MAX_GEMINI_INPUT_CHARS: int = 15000


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
