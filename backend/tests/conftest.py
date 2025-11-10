"""Test configuration and fixtures"""
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.core import get_service_container, ServiceContainer
from app.core.storage import StorageService, LocalStorageService
from app.core.background_tasks import InMemoryTaskQueue
from app.services import FileService, TaskService


@pytest.fixture(scope="session")
def test_app():
    """Create test FastAPI app with services registered"""
    app = create_app()
    
    # Register services for testing
    container = get_service_container()
    
    # Clear any existing registrations
    container._services.clear()
    container._factories.clear()
    container._singletons.clear()
    
    # Register test services
    storage_service = LocalStorageService()
    container.register_singleton(StorageService, storage_service)
    
    task_queue = InMemoryTaskQueue()
    container.register_singleton(InMemoryTaskQueue, task_queue)
    
    file_service = FileService(storage_service)
    container.register_singleton(FileService, file_service)
    
    task_service = TaskService(task_queue)
    container.register_singleton(TaskService, task_service)
    
    return app


@pytest.fixture
def client(test_app):
    """Create test client"""
    return TestClient(test_app)