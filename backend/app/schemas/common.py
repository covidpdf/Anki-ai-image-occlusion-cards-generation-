"""Common Pydantic schemas"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime, timezone


class BaseResponse(BaseModel):
    """Base response model"""
    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ErrorResponse(BaseResponse):
    """Error response model"""
    success: bool = False
    error_code: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    components: Optional[Dict[str, Dict[str, Any]]] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class StatusResponse(BaseModel):
    """Status response"""
    app_name: str
    version: str
    uptime: str
    environment: str
    features: Dict[str, bool]