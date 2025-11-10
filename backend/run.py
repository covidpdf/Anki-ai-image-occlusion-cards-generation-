#!/usr/bin/env python3
"""Development server startup script"""
import os
import sys
import uvicorn
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.core.config import get_settings
from app.core.logging import setup_logging

def main():
    """Start the development server"""
    settings = get_settings()
    
    # Setup logging
    setup_logging()
    
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"🌍 Server: http://{settings.host}:{settings.port}")
    print(f"📖 API Docs: http://{settings.host}:{settings.port}/docs")
    print(f"🔍 Alternative Docs: http://{settings.host}:{settings.port}/redoc")
    
    # Start uvicorn server
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
        access_log=True
    )

if __name__ == "__main__":
    main()