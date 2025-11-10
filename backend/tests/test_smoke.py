"""Comprehensive smoke tests for the backend API"""
import pytest
import asyncio
from pathlib import Path
import tempfile
import json

from app.core.config import get_settings


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self, client):
        """Test basic health check"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "version" in data
        assert "components" in data
        assert "storage" in data["components"]
        assert "task_queue" in data["components"]
    
    def test_status_endpoint(self, client):
        """Test detailed status endpoint"""
        response = client.get("/api/v1/status")
        assert response.status_code == 200
        data = response.json()
        assert "app_name" in data
        assert "version" in data
        assert "uptime" in data
        assert "environment" in data
        assert "features" in data
        assert data["features"]["file_upload"] is True
        assert data["features"]["background_tasks"] is True
    
    def test_ping_endpoint(self, client):
        """Test ping endpoint"""
        response = client.get("/api/v1/ping")
        assert response.status_code == 200
        data = response.json()
        assert "pong" in data
    
    def test_readiness_endpoint(self, client):
        """Test readiness probe"""
        response = client.get("/api/v1/readiness")
        assert response.status_code == 200
        data = response.json()
        assert data["ready"] is True
        assert "checks" in data
    
    def test_liveness_endpoint(self, client):
        """Test liveness probe"""
        response = client.get("/api/v1/liveness")
        assert response.status_code == 200
        data = response.json()
        assert data["alive"] is True


class TestFileEndpoints:
    """Test file upload and management endpoints"""
    
    def test_file_upload(self, client):
        """Test file upload functionality"""
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
            tmp.write(b"Test file content")
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, "rb") as f:
                response = client.post(
                    "/api/v1/files/upload",
                    files={"file": ("test.txt", f, "text/plain")},
                    data={"filename": "test_upload.txt"}
                )
            
            assert response.status_code == 200
            data = response.json()
            assert "file_key" in data
            assert data["filename"] == "test_upload.txt"
            assert data["content_type"] == "text/plain"
            assert "size" in data
            assert "url" in data
            
            # Store file key for subsequent tests
            return data["file_key"]
            
        finally:
            Path(tmp_path).unlink(missing_ok=True)
    
    def test_file_upload_invalid_type(self, client):
        """Test file upload with invalid file type"""
        with tempfile.NamedTemporaryFile(suffix=".exe", delete=False) as tmp:
            tmp.write(b"Fake executable content")
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, "rb") as f:
                response = client.post(
                    "/api/v1/files/upload",
                    files={"file": ("test.exe", f, "application/x-executable")}
                )
            
            assert response.status_code == 400
            assert "not allowed" in response.json()["detail"].lower()
            
        finally:
            Path(tmp_path).unlink(missing_ok=True)
    
    def test_file_info_not_found(self, client):
        """Test getting info for non-existent file"""
        response = client.get("/api/v1/files/info/nonexistent_file")
        assert response.status_code == 404
    
    def test_file_delete_not_found(self, client):
        """Test deleting non-existent file"""
        response = client.delete("/api/v1/files/nonexistent_file")
        assert response.status_code == 404


class TestTaskEndpoints:
    """Test background task endpoints"""
    
    def test_task_submit(self, client):
        """Test task submission"""
        response = client.post(
            "/api/v1/tasks/submit",
            json={
                "task_name": "demo_task",
                "parameters": {"test_param": "test_value"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "task_id" in data
        assert data["status"] == "pending"
        assert "submitted_at" in data
        
        return data["task_id"]
    
    def test_task_submit_invalid_name(self, client):
        """Test task submission with invalid task name"""
        response = client.post(
            "/api/v1/tasks/submit",
            json={
                "task_name": "invalid_task",
                "parameters": {}
            }
        )
        
        assert response.status_code == 400
        assert "Unknown task" in response.json()["detail"]
    
    def test_task_status_not_found(self, client):
        """Test getting status for non-existent task"""
        response = client.get("/api/v1/tasks/nonexistent_task/status")
        assert response.status_code == 404
    
    def test_task_result_not_found(self, client):
        """Test getting result for non-existent task"""
        response = client.get("/api/v1/tasks/nonexistent_task/result")
        assert response.status_code == 404
    
    def test_task_cancel_not_found(self, client):
        """Test cancelling non-existent task"""
        response = client.delete("/api/v1/tasks/nonexistent_task")
        assert response.status_code == 404
    
    def test_task_list(self, client):
        """Test task listing endpoint"""
        response = client.get("/api/v1/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data
        assert isinstance(data["tasks"], list)


class TestIntegration:
    """Integration tests"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "health" in data
        assert "status" in data
    
    def test_api_docs_available(self, client):
        """Test that API documentation is available"""
        response = client.get("/docs")
        assert response.status_code == 200
        
        response = client.get("/redoc")
        assert response.status_code == 200
        
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options("/api/v1/health")
        assert response.status_code == 200
        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers
    
    def test_full_workflow(self, client):
        """Test a complete workflow: upload file -> submit task -> check status"""
        # Step 1: Upload a file
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
            tmp.write(b"Test content for workflow")
            tmp_path = tmp.name
        
        try:
            with open(tmp_path, "rb") as f:
                upload_response = client.post(
                    "/api/v1/files/upload",
                    files={"file": ("workflow_test.txt", f, "text/plain")}
                )
            
            assert upload_response.status_code == 200
            file_data = upload_response.json()
            file_key = file_data["file_key"]
            
            # Step 2: Submit a background task
            task_response = client.post(
                "/api/v1/tasks/submit",
                json={
                    "task_name": "demo_task",
                    "parameters": {"file_key": file_key}
                }
            )
            
            assert task_response.status_code == 200
            task_data = task_response.json()
            task_id = task_data["task_id"]
            
            # Step 3: Check task status (may still be pending)
            status_response = client.get(f"/api/v1/tasks/{task_id}/status")
            assert status_response.status_code == 200
            status_data = status_response.json()
            assert status_data["task_id"] == task_id
            assert status_data["status"] in ["pending", "running", "completed", "retrying"]
            
            # Step 4: Check file info
            info_response = client.get(f"/api/v1/files/info/{file_key}")
            assert info_response.status_code == 200
            info_data = info_response.json()
            assert info_data["file_key"] == file_key
            assert info_data["exists"] is True
            
        finally:
            Path(tmp_path).unlink(missing_ok=True)


class TestErrorHandling:
    """Test error handling"""
    
    def test_404_endpoint(self, client):
        """Test 404 for non-existent endpoint"""
        response = client.get("/api/v1/nonexistent")
        assert response.status_code == 404
    
    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post(
            "/api/v1/tasks/submit",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestConfiguration:
    """Test configuration and settings"""
    
    def test_settings_loaded(self):
        """Test that settings are properly loaded"""
        settings = get_settings()
        assert settings.app_name is not None
        assert settings.app_version is not None
        assert settings.host is not None
        assert settings.port > 0
        assert isinstance(settings.cors_origins_list, list)
        assert len(settings.cors_origins_list) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])