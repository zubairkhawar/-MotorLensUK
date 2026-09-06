from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "MotorLens UK"
    database_url: str = f"sqlite:///{DATA_DIR / 'auto_intel.db'}"
    cors_origins: list[str] = ["http://localhost:3000"]
    scrape_delay_seconds: float = 2.0
    max_pages_per_source: int = 5
    user_agent: str = (
        "UK-Auto-Intel-Research/1.0 (Academic project; contact: student@example.com)"
    )


settings = Settings()

RAW_DIR.mkdir(parents=True, exist_ok=True)
CLEANED_DIR.mkdir(parents=True, exist_ok=True)
