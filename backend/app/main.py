"""FastAPI application entry point"""
from contextlib import asynccontextmanager
from typing import Any
import json
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core import (
    get_settings,
    setup_logging,
    get_service_container,
    ServiceContainer,
    StorageService,
    TaskQueue
)
from app.services import FileService, TaskService
from app.api import health_router, files_router, tasks_router
from app.core.background_tasks import InMemoryTaskQueue


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    settings = get_settings()
    
    # Setup logging
    setup_logging()
    
    # Initialize service container
    container = get_service_container()
    
    # Register services
    storage_service = StorageService()
    container.register_singleton(StorageService, storage_service)
    
    task_queue: TaskQueue = InMemoryTaskQueue()
    container.register_singleton(TaskQueue, task_queue)
    
    # Register custom services
    file_service = FileService(storage_service)
    container.register_singleton(FileService, file_service)
    
    task_service = TaskService(task_queue)
    container.register_singleton(TaskService, task_service)
    
    # Start background task worker
    if isinstance(task_queue, InMemoryTaskQueue):
        await task_queue.start_worker()
    
    print(f"🚀 {settings.app_name} v{settings.app_version} started successfully")
    print(f"📖 API Documentation: http://{settings.host}:{settings.port}/docs")
    print(f"🔍 Alternative Docs: http://{settings.host}:{settings.port}/redoc")
    
    yield
    
    # Cleanup
    if isinstance(task_queue, InMemoryTaskQueue):
        await task_queue.stop_worker()
    
    print("👋 Application shutdown complete")


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    settings = get_settings()
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.app_name,
        description="API for generating Anki flashcard images with AI-powered occlusion",
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(
        health_router,
        prefix="/api/v1",
        tags=["Health"]
    )
    
    app.include_router(
        files_router,
        prefix="/api/v1/files",
        tags=["Files"]
    )
    
    app.include_router(
        tasks_router,
        prefix="/api/v1/tasks",
        tags=["Tasks"]
    )
    
    # Mount static files for file serving
    from pathlib import Path
    storage_path = Path(settings.storage_path)
    if storage_path.exists():
        app.mount("/files", StaticFiles(directory=str(storage_path)), name="files")
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
            "status": "/api/v1/status"
        }
    
    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        """Global exception handler"""
        from app.core.logging import get_logger
        from fastapi.responses import JSONResponse
        logger = get_logger(__name__)
        logger.error("Unhandled exception", error=str(exc), path=request.url.path)
        
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )
    
    return app


# Create app instance
app = create_app()