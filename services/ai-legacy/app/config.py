from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API keys
    GEMINI_API_KEY: str | None = None
    PINECONE_API_KEY: str | None = None
    ALPHA_VANTAGE_KEY: str | None = None
    NEWS_API_KEY: str | None = None

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # CORS - Allow all localhost ports for development
    ALLOW_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:5180",
        "http://localhost:5181",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5181",
        "https://xtincapital.com",
        "https://www.xtincapital.com",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()