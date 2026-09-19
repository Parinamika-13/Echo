"""ECHO Configuration Management."""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "ECHO Financial & Real-Estate Intelligence"
    APP_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Database & InsForge
    DATABASE_URL: str = "sqlite:///./echo_backend.db"
    POSTGRES_URL: Optional[str] = None
    INSFORGE_URL: Optional[str] = None
    INSFORGE_ANON_KEY: Optional[str] = None
    INSFORGE_SERVICE_ROLE_KEY: Optional[str] = None

    @property
    def effective_db_url(self) -> str:
        """Return PostgreSQL URL if provided, otherwise default DATABASE_URL."""
        return self.POSTGRES_URL or self.DATABASE_URL

    # Future integration placeholders
    REDIS_URL: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_PROVIDER: Optional[str] = None
    VECTOR_DB_URL: Optional[str] = None
    GEOCODING_API_KEY: Optional[str] = None
    SCRAPER_API_KEY: Optional[str] = None


settings = Settings()

