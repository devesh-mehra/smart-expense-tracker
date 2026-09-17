import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Falls back to local SQLite for easy dev; set DATABASE_URL for Postgres in prod.
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./expense_tracker.db")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-change-me-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

    class Config:
        env_file = ".env"


settings = Settings()
