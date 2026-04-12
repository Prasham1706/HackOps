from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "flowmind"
    SECRET_KEY: str = "flowmind-dev-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_LOGIN_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_OAUTH_CLIENT_ID: str = ""
    GITHUB_OAUTH_CLIENT_SECRET: str = ""
    GITHUB_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/integrations/github/callback"
    NOTION_OAUTH_CLIENT_ID: str = ""
    NOTION_OAUTH_CLIENT_SECRET: str = ""
    NOTION_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/integrations/notion/callback"
    MCP_LAYER_URL: str = "http://localhost:9000"
    MCP_DEV_MOCK: bool = True
    FRONTEND_URL: str = "http://localhost:5173"
    GMAIL_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/integrations/gmail/callback"
    GITHUB_TOKEN: str = ""
    NOTION_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
