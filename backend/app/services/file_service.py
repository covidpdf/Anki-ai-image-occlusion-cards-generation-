"""File processing service"""
from typing import BinaryIO, Dict, Any, Optional
import magic
from pathlib import Path

from .base import BaseService
from ..core.storage import StorageService
from ..core.config import get_settings


class FileService(BaseService):
    """Service for file operations"""
    
    def __init__(self, storage_service: StorageService):
        super().__init__()
        self.storage_service = storage_service
        self.settings = get_settings()
    
    async def save_uploaded_file(
        self,
        file_data: BinaryIO,
        filename: str,
        content_type: str = None
    ) -> Dict[str, Any]:
        """Save uploaded file with validation"""
        # Detect content type if not provided
        if not content_type:
            content_type = await self._detect_content_type(file_data)
        
        # Validate file type
        if not self._is_allowed_file_type(content_type):
            raise ValueError(f"File type {content_type} not allowed")
        
        # Validate file size
        file_size = await self._get_file_size(file_data)
        if file_size > self.settings.max_file_size:
            raise ValueError(f"File size {file_size} exceeds maximum {self.settings.max_file_size}")
        
        # Save file
        file_key = await self.storage_service.save(file_data, filename, content_type)
        
        self.log_info(
            "File saved successfully",
            file_key=file_key,
            filename=filename,
            content_type=content_type,
            size=file_size
        )
        
        return {
            "file_key": file_key,
            "filename": filename,
            "content_type": content_type,
            "size": file_size,
            "url": await self.storage_service.get_url(file_key)
        }
    
    async def get_file_info(self, file_key: str) -> Optional[Dict[str, Any]]:
        """Get file information"""
        if not await self.storage_service.exists(file_key):
            return None
        
        return {
            "file_key": file_key,
            "exists": True,
            "url": await self.storage_service.get_url(file_key)
        }
    
    async def delete_file(self, file_key: str) -> bool:
        """Delete file"""
        success = await self.storage_service.delete(file_key)
        
        if success:
            self.log_info("File deleted successfully", file_key=file_key)
        else:
            self.log_warning("File deletion failed", file_key=file_key)
        
        return success
    
    async def _detect_content_type(self, file_data: BinaryIO) -> str:
        """Detect file content type using python-magic"""
        try:
            # Read a small chunk for content type detection
            current_pos = file_data.tell()
            file_data.seek(0)
            chunk = file_data.read(1024)
            file_data.seek(current_pos)
            
            content_type = magic.from_buffer(chunk, mime=True)
            return content_type or "application/octet-stream"
            
        except Exception as e:
            self.log_warning("Failed to detect content type", error=str(e))
            return "application/octet-stream"
    
    def _is_allowed_file_type(self, content_type: str) -> bool:
        """Check if file type is allowed"""
        return content_type in self.settings.allowed_file_types
    
    async def _get_file_size(self, file_data: BinaryIO) -> int:
        """Get file size"""
        current_pos = file_data.tell()
        file_data.seek(0, 2)  # Seek to end
        size = file_data.tell()
        file_data.seek(current_pos)  # Reset position
        return size