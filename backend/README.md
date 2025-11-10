# Backend - FastAPI Foundation

A comprehensive FastAPI backend foundation with modular architecture, dependency injection, background task processing, and file handling capabilities.

## Features

- **🚀 FastAPI Framework**: Modern, fast web framework for building APIs
- **🔧 Modular Architecture**: Clean separation of concerns with layers (API, Services, Core)
- **💉 Dependency Injection**: Custom DI container for service management
- **📁 File Management**: Upload, download, and storage abstraction (local/S3)
- **⚡ Background Tasks**: Async task processing with Redis/RQ support
- **🏥 Health Checks**: Comprehensive health monitoring and status endpoints
- **📝 Structured Logging**: JSON-based logging with structlog
- **🔒 CORS Support**: Configurable cross-origin resource sharing
- **📊 Pydantic Schemas**: Type-safe data validation and serialization
- **🐳 Docker Support**: Containerized deployment with Docker Compose
- **🧪 Testing**: Comprehensive smoke tests and pytest integration

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── health.py          # Health check endpoints
│   │   ├── files.py           # File upload/management
│   │   ├── tasks.py           # Background task management
│   │   └── __init__.py
│   ├── core/                   # Core application components
│   │   ├── config.py          # Settings management
│   │   ├── logging.py         # Logging configuration
│   │   ├── dependencies.py    # Dependency injection
│   │   ├── storage.py         # Storage abstraction
│   │   ├── background_tasks.py # Task queue abstraction
│   │   └── __init__.py
│   ├── services/               # Business logic layer
│   │   ├── base.py            # Base service class
│   │   ├── file_service.py    # File operations
│   │   ├── task_service.py    # Task management
│   │   └── __init__.py
│   ├── schemas/               # Pydantic models
│   │   ├── common.py          # Common schemas
│   │   ├── file_schemas.py    # File-related schemas
│   │   ├── task_schemas.py    # Task-related schemas
│   │   └── __init__.py
│   ├── models/                # Database models (future)
│   │   └── __init__.py
│   ├── main.py               # FastAPI application entry point
│   ├── run.py                # Development server script
│   ├── worker.py             # Background task worker
│   └── __init__.py
├── tests/                    # Test suite
│   ├── test_health.py        # Health endpoint tests
│   ├── test_smoke.py         # Comprehensive smoke tests
│   └── __init__.py
├── storage/                  # Local file storage
├── uploads/                  # Temporary upload directory
├── Dockerfile               # Docker configuration
├── requirements.txt         # Python dependencies
├── pyproject.toml          # Project configuration
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server**:
   ```bash
   python run.py
   # Or:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API**:
   - API Documentation: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc
   - Health Check: http://localhost:8000/api/v1/health

### Docker Deployment

1. **Using Docker Compose**:
   ```bash
   # From project root
   docker-compose -f docker-compose.backend.yml up -d
   ```

2. **Services included**:
   - API Server (port 8000)
   - Redis (port 6379)
   - Background Workers (2 instances)
   - Redis Dashboard (port 8081, optional)

3. **Stop services**:
   ```bash
   docker-compose -f docker-compose.backend.yml down
   ```

## API Endpoints

### Health & Status
- `GET /api/v1/health` - Comprehensive health check
- `GET /api/v1/status` - Application status and features
- `GET /api/v1/ping` - Simple ping for load balancers
- `GET /api/v1/readiness` - Kubernetes readiness probe
- `GET /api/v1/liveness` - Kubernetes liveness probe

### File Management
- `POST /api/v1/files/upload` - Upload a file
- `GET /api/v1/files/info/{file_key}` - Get file information
- `GET /api/v1/files/download/{file_key}` - Download a file
- `DELETE /api/v1/files/{file_key}` - Delete a file
- `GET /api/v1/files/list` - List all files (placeholder)

### Background Tasks
- `POST /api/v1/tasks/submit` - Submit a background task
- `GET /api/v1/tasks/{task_id}/status` - Get task status
- `GET /api/v1/tasks/{task_id}/result` - Get task result
- `DELETE /api/v1/tasks/{task_id}` - Cancel a task
- `GET /api/v1/tasks/{task_id}/wait` - Wait for task completion
- `GET /api/v1/tasks/` - List all tasks (placeholder)

## Configuration

### Environment Variables

Key configuration options (see `.env.example`):

```bash
# Application
APP_NAME=Anki Image Occlusion API
DEBUG=false
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=["image/jpeg", "image/png", "image/webp"]

# Storage
STORAGE_TYPE=local  # local, s3
STORAGE_PATH=storage

# Redis (Background Tasks)
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
```

### Storage Options

#### Local Storage (Default)
Files are stored in the `storage/` directory.

#### AWS S3 Storage
Set the following environment variables:
```bash
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket
```

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_smoke.py

# Run with verbose output
pytest -v
```

### Code Quality

```bash
# Format code
black .

# Lint code
ruff check .

# Type checking (if using mypy)
mypy app/
```

### Adding New Services

1. Create service class inheriting from `BaseService`
2. Register in dependency container in `main.py`
3. Create Pydantic schemas in `schemas/`
4. Add API endpoints in `api/`

Example:
```python
# services/my_service.py
from .base import BaseService
from ..core.logging import get_logger

class MyService(BaseService):
    def __init__(self):
        super().__init__()
    
    async def do_something(self):
        self.log_info("Doing something")
        return {"result": "success"}
```

## Background Tasks

### Using In-Memory Queue (Development)

The default implementation uses an in-memory queue suitable for development.

### Using Redis Queue (Production)

1. Ensure Redis is running
2. Set `REDIS_URL` environment variable
3. Start workers:
   ```bash
   python worker.py
   # Or using Docker Compose
   docker-compose -f docker-compose.backend.yml up worker
   ```

### Creating Custom Tasks

```python
from app.core.background_tasks import get_task_queue

async def my_background_task(data: dict):
    """Custom background task"""
    # Process data
    result = await process_data(data)
    return result

# Submit task
task_queue = get_task_queue()
task_id = await task_queue.enqueue(my_background_task, {"key": "value"})
```

## Monitoring & Logging

### Structured Logging

The application uses structured logging with `structlog`. Logs are output as JSON in production and formatted for development.

### Health Monitoring

- Health checks include storage and task queue status
- Kubernetes-ready with readiness/liveness probes
- Component-level health reporting

### Redis Dashboard

When using Docker Compose with monitoring profile:
```bash
docker-compose -f docker-compose.backend.yml --profile monitoring up
```

Access Redis Dashboard at: http://localhost:8081

## Production Deployment

### Environment Setup

1. Set `DEBUG=false`
2. Configure proper CORS origins
3. Set up Redis cluster
4. Configure S3 storage
5. Set up proper logging levels
6. Configure reverse proxy (nginx/caddy)

### Docker Production

```bash
# Build image
docker build -t anki-backend ./backend

# Run with environment variables
docker run -d \
  -p 8000:8000 \
  -e REDIS_URL=redis://your-redis:6379/0 \
  -e STORAGE_TYPE=s3 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -v /path/to/storage:/app/storage \
  anki-backend
```

### Scaling Workers

```bash
# Scale workers using Docker Compose
docker-compose -f docker-compose.backend.yml up -d --scale worker=5
```

## Contributing

1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Run pre-commit hooks before committing
5. Ensure all tests pass

## License

MIT License