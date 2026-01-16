from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://stackpilot:stackpilot@db:5432/stackpilot"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    platform_base_url: str = "http://localhost"
    deploy_host: str = "host.docker.internal"
    algorithm: str = "HS256"


settings = Settings()
