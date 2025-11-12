"""File upload API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.services.file_service import FileValidationError, list_uploads, save_file

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_file(file: UploadFile):
    """Handle file upload and return metadata"""
    try:
        file_metadata = save_file(file)
        return {
            "file_id": file_metadata["file_id"],
            "filename": file_metadata["filename"],
            "size": file_metadata["size"],
            "upload_timestamp": file_metadata["upload_timestamp"],
        }
    except FileValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload failed"
        ) from exc


@router.get("/upload", status_code=status.HTTP_200_OK)
async def get_uploads():
    """List recent uploads"""
    return list_uploads()
