from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CyberSentinel"
    environment: str = "development"

    # Bright Data
    bright_data_api_key: str = ""
    bright_data_username: str = ""
    bright_data_password: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # Database
    mongodb_uri: str = "mongodb://localhost:27017/cybersentinel"
    redis_url: str = "redis://localhost:6379"

    # Alerts
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    # App
    secret_key: str = "changeme-set-a-real-secret"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
