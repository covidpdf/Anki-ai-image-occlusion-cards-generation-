"""File upload and management service"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


class FileValidationError(Exception):
    """Custom exception for file validation errors"""

    pass


def get_upload_dir() -> Path:
    """Get the upload directory path"""
    upload_dir = Path(os.environ.get("UPLOAD_DIR", "/tmp/uploads"))
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file type and size

    Args:
        file: FastAPI UploadFile object

    Raises:
        FileValidationError: If file validation fails
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise FileValidationError(
            f"Invalid file type: {file.content_type}. "
            f"Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )

    # Check file size by seeking to end
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise FileValidationError(
            f"File size {file_size} bytes exceeds maximum allowed size "
            f"of {MAX_FILE_SIZE} bytes (20MB)"
        )


def save_file(file: UploadFile) -> dict:
    """
    Save uploaded file to storage

    Args:
        file: FastAPI UploadFile object

    Returns:
        dict: File metadata including file_id, filename, size, and upload_timestamp

    Raises:
        FileValidationError: If file validation fails
    """
    validate_file(file)

    file_id = str(uuid.uuid4())
    upload_dir = get_upload_dir()

    # Get file extension
    file_extension = ""
    if file.filename:
        file_extension = Path(file.filename).suffix

    # Create unique filename
    saved_filename = f"{file_id}{file_extension}"
    file_path = upload_dir / saved_filename

    # Save file
    with open(file_path, "wb") as f:
        content = file.file.read()
        f.write(content)

    # Get file size
    file_size = len(content)

    return {
        "file_id": file_id,
        "filename": file.filename or saved_filename,
        "size": file_size,
        "upload_timestamp": datetime.utcnow().isoformat(),
        "path": str(file_path),
    }


def list_uploads() -> list[dict]:
    """
    Get list of recent uploads

    Returns:
        list: List of upload metadata dictionaries
    """
    upload_dir = get_upload_dir()
    uploads = []

    if not upload_dir.exists():
        return uploads

    for file_path in upload_dir.iterdir():
        if file_path.is_file():
            stat = file_path.stat()
            uploads.append(
                {
                    "file_id": file_path.stem,
                    "filename": file_path.name,
                    "size": stat.st_size,
                    "upload_timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                }
            )

    # Sort by modification time, newest first
    uploads.sort(key=lambda x: x["upload_timestamp"], reverse=True)

    return uploads
