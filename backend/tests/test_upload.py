"""Tests for upload API endpoints"""
import io
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_upload_valid_pdf():
    """Test uploading a valid PDF file"""
    # Create a mock PDF file
    file_content = b"%PDF-1.4 mock content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "file_id" in data
    assert data["filename"] == "test.pdf"
    assert data["size"] == len(file_content)
    assert "upload_timestamp" in data


def test_upload_valid_jpeg():
    """Test uploading a valid JPEG image"""
    file_content = b"\xff\xd8\xff\xe0\x00\x10JFIF mock jpeg content"
    files = {"file": ("test.jpg", io.BytesIO(file_content), "image/jpeg")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "file_id" in data
    assert data["filename"] == "test.jpg"
    assert data["size"] == len(file_content)


def test_upload_valid_png():
    """Test uploading a valid PNG image"""
    file_content = b"\x89PNG\r\n\x1a\n mock png content"
    files = {"file": ("test.png", io.BytesIO(file_content), "image/png")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "file_id" in data
    assert data["filename"] == "test.png"


def test_upload_valid_gif():
    """Test uploading a valid GIF image"""
    file_content = b"GIF89a mock gif content"
    files = {"file": ("test.gif", io.BytesIO(file_content), "image/gif")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "file_id" in data
    assert data["filename"] == "test.gif"


def test_upload_valid_webp():
    """Test uploading a valid WebP image"""
    file_content = b"RIFF....WEBP mock webp content"
    files = {"file": ("test.webp", io.BytesIO(file_content), "image/webp")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "file_id" in data
    assert data["filename"] == "test.webp"


def test_upload_invalid_file_type():
    """Test uploading an invalid file type returns 400 error"""
    file_content = b"plain text content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 400

    data = response.json()
    assert "detail" in data
    assert "Invalid file type" in data["detail"]


def test_upload_file_too_large():
    """Test uploading a file larger than 20MB returns 400 error"""
    # Create a file slightly larger than 20MB
    file_size = 21 * 1024 * 1024
    file_content = b"x" * file_size
    files = {"file": ("large.pdf", io.BytesIO(file_content), "application/pdf")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 400

    data = response.json()
    assert "detail" in data
    assert "exceeds maximum allowed size" in data["detail"]


def test_get_uploads():
    """Test getting list of uploads"""
    # First upload a file
    file_content = b"%PDF-1.4 mock content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    client.post("/api/upload", files=files)

    # Get list of uploads
    response = client.get("/api/upload")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "file_id" in data[0]
        assert "filename" in data[0]
        assert "size" in data[0]
        assert "upload_timestamp" in data[0]
