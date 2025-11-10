"""File-related schemas"""
from pydantic import BaseModel, Field
from typing import Optional


class FileUploadRequest(BaseModel):
    """File upload request metadata"""
    filename: str = Field(..., description="Original filename")
    content_type: Optional[str] = Field(None, description="MIME type")


class FileUploadResponse(BaseModel):
    """File upload response"""
    file_key: str = Field(..., description="Unique file identifier")
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type")
    size: int = Field(..., description="File size in bytes")
    url: str = Field(..., description="File access URL")


class FileInfoResponse(BaseModel):
    """File information response"""
    file_key: str = Field(..., description="Unique file identifier")
    exists: bool = Field(..., description="Whether file exists")
    url: Optional[str] = Field(None, description="File access URL")


class FileDeleteResponse(BaseModel):
    """File deletion response"""
    file_key: str = Field(..., description="Unique file identifier")
    deleted: bool = Field(..., description="Whether file was deleted")