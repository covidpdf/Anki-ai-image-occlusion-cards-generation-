"""Tests for file service"""
import io
import os
import tempfile
from pathlib import Path

import pytest
from fastapi import UploadFile

from app.services.file_service import (
    FileValidationError,
    get_upload_dir,
    list_uploads,
    save_file,
    validate_file,
)


def create_upload_file(content: bytes, filename: str, content_type: str) -> UploadFile:
    """Helper to create an UploadFile for testing"""
    return UploadFile(
        file=io.BytesIO(content),
        filename=filename,
        headers={"content-type": content_type},
    )


def test_validate_file_valid_pdf():
    """Test validation of valid PDF file"""
    file = create_upload_file(b"%PDF-1.4 content", "test.pdf", "application/pdf")
    validate_file(file)  # Should not raise


def test_validate_file_valid_jpeg():
    """Test validation of valid JPEG file"""
    file = create_upload_file(b"jpeg content", "test.jpg", "image/jpeg")
    validate_file(file)  # Should not raise


def test_validate_file_valid_png():
    """Test validation of valid PNG file"""
    file = create_upload_file(b"png content", "test.png", "image/png")
    validate_file(file)  # Should not raise


def test_validate_file_valid_gif():
    """Test validation of valid GIF file"""
    file = create_upload_file(b"gif content", "test.gif", "image/gif")
    validate_file(file)  # Should not raise


def test_validate_file_valid_webp():
    """Test validation of valid WebP file"""
    file = create_upload_file(b"webp content", "test.webp", "image/webp")
    validate_file(file)  # Should not raise


def test_validate_file_invalid_type():
    """Test validation of invalid file type"""
    file = create_upload_file(b"text content", "test.txt", "text/plain")
    with pytest.raises(FileValidationError) as exc_info:
        validate_file(file)
    assert "Invalid file type" in str(exc_info.value)


def test_validate_file_too_large():
    """Test validation of file exceeding size limit"""
    large_content = b"x" * (21 * 1024 * 1024)  # 21MB
    file = create_upload_file(large_content, "large.pdf", "application/pdf")
    with pytest.raises(FileValidationError) as exc_info:
        validate_file(file)
    assert "exceeds maximum allowed size" in str(exc_info.value)


def test_save_file_creates_file(tmp_path):
    """Test that save_file creates file in storage"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    content = b"%PDF-1.4 test content"
    file = create_upload_file(content, "test.pdf", "application/pdf")

    result = save_file(file)

    assert "file_id" in result
    assert result["filename"] == "test.pdf"
    assert result["size"] == len(content)
    assert "upload_timestamp" in result
    assert "path" in result

    # Verify file was created
    saved_path = Path(result["path"])
    assert saved_path.exists()
    assert saved_path.read_bytes() == content


def test_save_file_generates_unique_id(tmp_path):
    """Test that save_file generates unique file IDs"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    file1 = create_upload_file(b"content1", "test1.pdf", "application/pdf")
    file2 = create_upload_file(b"content2", "test2.pdf", "application/pdf")

    result1 = save_file(file1)
    result2 = save_file(file2)

    assert result1["file_id"] != result2["file_id"]


def test_save_file_preserves_extension(tmp_path):
    """Test that save_file preserves file extension"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    file = create_upload_file(b"jpeg content", "image.jpg", "image/jpeg")
    result = save_file(file)

    saved_path = Path(result["path"])
    assert saved_path.suffix == ".jpg"


def test_save_file_invalid_file_raises_error(tmp_path):
    """Test that save_file raises error for invalid file"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    file = create_upload_file(b"text content", "test.txt", "text/plain")

    with pytest.raises(FileValidationError):
        save_file(file)


def test_list_uploads_empty_directory(tmp_path):
    """Test list_uploads with empty upload directory"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    result = list_uploads()
    assert result == []


def test_list_uploads_returns_files(tmp_path):
    """Test list_uploads returns uploaded files"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    # Upload some files
    file1 = create_upload_file(b"content1", "test1.pdf", "application/pdf")
    file2 = create_upload_file(b"content2", "test2.jpg", "image/jpeg")

    save_file(file1)
    save_file(file2)

    result = list_uploads()

    assert len(result) == 2
    assert all("file_id" in item for item in result)
    assert all("filename" in item for item in result)
    assert all("size" in item for item in result)
    assert all("upload_timestamp" in item for item in result)


def test_list_uploads_sorted_by_time(tmp_path):
    """Test list_uploads returns files sorted by upload time"""
    os.environ["UPLOAD_DIR"] = str(tmp_path)

    # Create test files directly in the upload directory
    (tmp_path / "file1.txt").write_bytes(b"content1")
    (tmp_path / "file2.txt").write_bytes(b"content2")
    (tmp_path / "file3.txt").write_bytes(b"content3")

    result = list_uploads()

    # Should have 3 files sorted by modification time (newest first)
    assert len(result) == 3
    timestamps = [item["upload_timestamp"] for item in result]
    assert timestamps == sorted(timestamps, reverse=True)


def test_get_upload_dir_creates_directory(tmp_path):
    """Test get_upload_dir creates directory if it doesn't exist"""
    upload_path = tmp_path / "uploads"
    os.environ["UPLOAD_DIR"] = str(upload_path)

    result = get_upload_dir()

    assert result == upload_path
    assert upload_path.exists()
    assert upload_path.is_dir()


def test_get_upload_dir_default_path():
    """Test get_upload_dir uses default path when not configured"""
    if "UPLOAD_DIR" in os.environ:
        del os.environ["UPLOAD_DIR"]

    result = get_upload_dir()

    assert result == Path("/tmp/uploads")
