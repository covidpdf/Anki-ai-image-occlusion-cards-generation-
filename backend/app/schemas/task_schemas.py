"""Task-related schemas"""
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime, timezone


class TaskSubmitRequest(BaseModel):
    """Task submission request"""
    task_name: str = Field(..., description="Name of the task to execute")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Task parameters")
    max_retries: Optional[int] = Field(None, description="Maximum retry attempts")


class TaskSubmitResponse(BaseModel):
    """Task submission response"""
    task_id: str = Field(..., description="Unique task identifier")
    status: str = Field(..., description="Initial task status")
    submitted_at: datetime = Field(..., description="Task submission timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class TaskStatusResponse(BaseModel):
    """Task status response"""
    task_id: str = Field(..., description="Unique task identifier")
    func_name: str = Field(..., description="Function name")
    status: str = Field(..., description="Current task status")
    created_at: datetime = Field(..., description="Task creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Task start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Task completion timestamp")
    retry_count: int = Field(..., description="Number of retry attempts")
    max_retries: int = Field(..., description="Maximum retry attempts")
    result: Optional[Any] = Field(None, description="Task result if completed")
    error: Optional[str] = Field(None, description="Error message if failed")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class TaskListResponse(BaseModel):
    """Task list response"""
    tasks: List[TaskStatusResponse] = Field(..., description="List of tasks")
    total: int = Field(..., description="Total number of tasks")