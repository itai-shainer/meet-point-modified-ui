"""Application settings, loaded from environment variables / .env."""

from __future__ import annotations

import json
import secrets
from functools import lru_cache
from typing import Annotated, List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- General -----------------------------------------------------------
    APP_ENV: str = "development"
    PROJECT_NAME: str = "MeetPoint API"
    API_V1_PREFIX: str = "/api/v1"
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000

    # --- Database ----------------------------------------------------------
    # SQLite locally, Postgres in production (Railway injects DATABASE_URL).
    DATABASE_URL: str = "sqlite:///./meetpoint.db"

    # --- Auth --------------------------------------------------------------
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MINUTES: int = 30
    REFRESH_TOKEN_TTL_DAYS: int = 30
    REFRESH_COOKIE_NAME: str = "meetpoint_refresh"
    # Set COOKIE_SECURE=true and COOKIE_SAMESITE=none when the API and the SPA
    # are served from different domains over HTTPS.
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: Optional[str] = None
    # NoDecode: let _split_csv below handle the raw env string. Without it,
    # pydantic-settings json.loads() complex fields before validators run,
    # so a plain comma-separated value raises a JSONDecodeError at import.
    ADMIN_EMAILS: Annotated[List[str], NoDecode] = []

    # --- CORS --------------------------------------------------------------
    CORS_ORIGINS: Annotated[List[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # --- Route optimizer ---------------------------------------------------
    # The pickup-optimizer service. Kept as a separate deployable; this API
    # proxies to it so the browser never talks to it directly.
    OPTIMIZER_API_URL: str = "https://meet-point-api-production.up.railway.app"
    OPTIMIZER_TIMEOUT_SECONDS: float = 60.0

    # --- Static frontend ---------------------------------------------------
    # When true, the API also serves the built SPA (single-service deploy).
    SERVE_STATIC: bool = False
    STATIC_DIR: str = "dist"

    @field_validator("CORS_ORIGINS", "ADMIN_EMAILS", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        """Accept both a JSON array and a plain comma-separated string."""
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                # These fields are NoDecode, so parse the JSON form ourselves.
                try:
                    return json.loads(stripped)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"expected a JSON array or comma-separated list: {exc}") from exc
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() in {"production", "prod"}

    @property
    def sqlalchemy_url(self) -> str:
        """Normalise Railway/Heroku style postgres:// URLs for SQLAlchemy 2.x."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.JWT_SECRET:
        if settings.is_production:
            raise RuntimeError(
                "JWT_SECRET must be set in production. "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(48))'"
            )
        # Ephemeral dev secret: tokens are invalidated on every restart.
        settings.JWT_SECRET = secrets.token_urlsafe(48)
    return settings


settings = get_settings()
