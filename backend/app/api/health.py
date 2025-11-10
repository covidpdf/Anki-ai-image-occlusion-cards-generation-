"""Enhanced health check endpoints"""
from datetime import datetime, timezone
from typing import Dict, Any
import asyncio

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from ..core.config import get_settings
from ..core.logging import get_logger
from ..core.dependencies import get_service_container
from ..core.storage import StorageService
from ..core.background_tasks import TaskQueue
from ..schemas.common import HealthResponse, StatusResponse

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    settings = get_settings()
    
    # Basic health check
    health_data = {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc),
        "components": {}
    }
    
    # Check storage service
    try:
        container = get_service_container()
        storage_service = container.get(StorageService)
        # Test storage with a simple operation
        test_key = "health_check_test"
        exists_before = await storage_service.exists(test_key)
        health_data["components"]["storage"] = {
            "status": "healthy",
            "type": settings.storage_type,
            "test_passed": True
        }
    except Exception as e:
        logger.error("Storage health check failed", error=str(e))
        health_data["components"]["storage"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_data["status"] = "degraded"
    
    # Check task queue
    try:
        task_queue = container.get(TaskQueue)
        health_data["components"]["task_queue"] = {
            "status": "healthy",
            "type": type(task_queue).__name__
        }
    except Exception as e:
        logger.error("Task queue health check failed", error=str(e))
        health_data["components"]["task_queue"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_data["status"] = "degraded"
    
    # Return appropriate HTTP status
    status_code = 200 if health_data["status"] == "healthy" else 503
    
    return JSONResponse(
        status_code=status_code,
        content=health_data
    )


@router.get("/status", response_model=StatusResponse)
async def app_status():
    """Detailed application status"""
    settings = get_settings()
    
    # Calculate uptime (placeholder - would track actual start time)
    uptime = "0h 0m 0s"  # TODO: Implement actual uptime tracking
    
    return StatusResponse(
        app_name=settings.app_name,
        version=settings.app_version,
        uptime=uptime,
        environment="development" if settings.debug else "production",
        features={
            "file_upload": True,
            "background_tasks": True,
            "storage": True,
            "cors": True,
            "logging": True,
        }
    )


@router.get("/ping")
async def ping():
    """Simple ping endpoint for load balancers"""
    return {"pong": datetime.now(timezone.utc).isoformat()}


@router.get("/readiness")
async def readiness_check():
    """Readiness probe for Kubernetes/container orchestration"""
    # Check if the application is ready to serve traffic
    settings = get_settings()
    
    try:
        # Basic readiness checks
        container = get_service_container()
        storage_service = container.get(StorageService)
        task_queue = container.get(TaskQueue)
        
        return {
            "ready": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "checks": {
                "storage": "ok",
                "task_queue": "ok",
            }
        }
    except Exception as e:
        logger.error("Readiness check failed", error=str(e))
        return JSONResponse(
            status_code=503,
            content={
                "ready": False,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }
        )


@router.get("/liveness")
async def liveness_check():
    """Liveness probe for Kubernetes/container orchestration"""
    # Check if the application is still alive
    return {
        "alive": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }