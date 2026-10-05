"""Application settings, loaded from environment variables.

Every value has a safe development default, so the app boots with zero setup.
In production the same names are overridden via real environment variables.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="VOLATONE_",
        env_file=(".env", "../.env"),
        extra="ignore",
    )

    environment: str = "development"
    database_url: str = "postgresql://volatone:volatone@localhost:5432/volatone"
    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    """Build Settings once and reuse it (cached)."""
    return Settings()
