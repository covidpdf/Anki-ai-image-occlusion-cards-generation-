"""Storage abstraction layer"""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Optional, Dict, Any
import shutil
import os
from datetime import datetime

from .config import get_settings
from .logging import get_logger

logger = get_logger(__name__)


class StorageService(ABC):
    """Abstract storage service"""
    
    @abstractmethod
    async def save(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """Save file and return the key/URL"""
        pass
    
    @abstractmethod
    async def get(self, key: str) -> Optional[bytes]:
        """Get file data by key"""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete file by key"""
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if file exists"""
        pass
    
    @abstractmethod
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get temporary URL for file access"""
        pass


class LocalStorageService(StorageService):
    """Local file system storage implementation"""
    
    def __init__(self, storage_path: str = None):
        self.settings = get_settings()
        self.storage_path = Path(storage_path or self.settings.storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
    def _get_file_path(self, key: str) -> Path:
        """Get full file path for a key"""
        return self.storage_path / key
    
    async def save(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """Save file to local storage"""
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name, ext = os.path.splitext(filename)
        key = f"{timestamp}_{name}{ext}"
        
        file_path = self._get_file_path(key)
        
        try:
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file_data, f)
            
            logger.info("File saved successfully", key=key, path=str(file_path))
            return key
            
        except Exception as e:
            logger.error("Failed to save file", key=key, error=str(e))
            raise
    
    async def get(self, key: str) -> Optional[bytes]:
        """Get file data from local storage"""
        file_path = self._get_file_path(key)
        
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, "rb") as f:
                return f.read()
        except Exception as e:
            logger.error("Failed to read file", key=key, error=str(e))
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete file from local storage"""
        file_path = self._get_file_path(key)
        
        if not file_path.exists():
            return False
        
        try:
            file_path.unlink()
            logger.info("File deleted successfully", key=key)
            return True
        except Exception as e:
            logger.error("Failed to delete file", key=key, error=str(e))
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if file exists in local storage"""
        return self._get_file_path(key).exists()
    
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get URL for local file access"""
        # For local storage, return a relative URL that can be served by FastAPI
        return f"/files/{key}"


class S3StorageService(StorageService):
    """AWS S3 storage implementation (placeholder)"""
    
    def __init__(self):
        self.settings = get_settings()
        logger.warning("S3 storage not fully implemented - using placeholder")
    
    async def save(self, file_data: BinaryIO, filename: str, content_type: str) -> str:
        """Placeholder for S3 save"""
        key = f"s3_placeholder_{filename}"
        logger.info("S3 save (placeholder)", key=key)
        return key
    
    async def get(self, key: str) -> Optional[bytes]:
        """Placeholder for S3 get"""
        logger.info("S3 get (placeholder)", key=key)
        return None
    
    async def delete(self, key: str) -> bool:
        """Placeholder for S3 delete"""
        logger.info("S3 delete (placeholder)", key=key)
        return True
    
    async def exists(self, key: str) -> bool:
        """Placeholder for S3 exists"""
        logger.info("S3 exists (placeholder)", key=key)
        return False
    
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Placeholder for S3 URL generation"""
        return f"https://s3-placeholder-url.com/{key}"


def get_storage_service() -> StorageService:
    """Get appropriate storage service based on settings"""
    settings = get_settings()
    
    if settings.storage_type == "s3":
        return S3StorageService()
    else:
        return LocalStorageService()