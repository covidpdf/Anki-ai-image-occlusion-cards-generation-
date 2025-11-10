"""Application settings management"""
from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Application
    app_name: str = "Anki Image Occlusion API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="CORS allowed origins"
    )
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # File Upload
    max_file_size: int = Field(default=10 * 1024 * 1024, description="Max file size in bytes (10MB)")
    allowed_file_types: List[str] = Field(
        default=["image/jpeg", "image/png", "image/webp"],
        description="Allowed MIME types"
    )
    upload_dir: str = "uploads"
    
    # Redis (for background tasks)
    redis_url: str = "redis://localhost:6379/0"
    redis_queue_name: str = "default"
    
    # Storage
    storage_type: str = "local"  # local, s3, gcs
    storage_path: str = "storage"
    
    # AWS S3 (optional)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    
    # Background Tasks
    background_task_timeout: int = 300  # 5 minutes
    max_retries: int = 3
    
    # Health Checks
    health_check_interval: int = 30
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as list"""
        if isinstance(self.cors_origins, str):
            # Handle string representation from env
            import ast
            try:
                return ast.literal_eval(self.cors_origins)
            except (ValueError, SyntaxError):
                return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()