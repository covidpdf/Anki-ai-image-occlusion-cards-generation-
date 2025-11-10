"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import export, health

app = FastAPI(
    title="Anki Image Occlusion API",
    description="API for generating Anki flashcard images with AI-powered occlusion",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Anki Image Occlusion API",
        "docs": "/docs",
    }
