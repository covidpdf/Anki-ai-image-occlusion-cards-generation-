"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import decks, export, health, ocr, upload

app = FastAPI(
    title="Anki Decks Pro API",
    description="Lightweight API services for the Anki Decks Pro MVP",
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
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
app.include_router(decks.router, prefix="/decks", tags=["decks"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(upload.router)



@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Anki Decks Pro API",
        "docs": "/docs",
    }
