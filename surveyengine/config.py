from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite:///./dev.db")
    SECRET_KEY: str = Field(default="change-this-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")
    ALLOW_OPEN_REGISTRATION: bool = True  # set False in prod; then only admin can create users

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
