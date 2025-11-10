"""File upload and management endpoints"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse

from ..core.dependencies import get_service_container
from ..core.storage import StorageService
from ..services.file_service import FileService
from ..schemas.file_schemas import (
    FileUploadResponse,
    FileInfoResponse,
    FileDeleteResponse
)
from ..schemas.common import ErrorResponse

router = APIRouter()


def get_file_service() -> FileService:
    """Get file service instance"""
    container = get_service_container()
    storage_service = container.get(StorageService)
    return FileService(storage_service)


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    filename: Optional[str] = Form(None),
    file_service: FileService = Depends(get_file_service)
):
    """Upload a file"""
    try:
        # Use provided filename or original filename
        final_filename = filename or file.filename or "uploaded_file"
        
        # Save file
        result = await file_service.save_uploaded_file(
            file_data=file.file,
            filename=final_filename,
            content_type=file.content_type
        )
        
        return FileUploadResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/info/{file_key}", response_model=FileInfoResponse)
async def get_file_info(
    file_key: str,
    file_service: FileService = Depends(get_file_service)
):
    """Get file information"""
    try:
        file_info = await file_service.get_file_info(file_key)
        
        if not file_info:
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileInfoResponse(**file_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file info: {str(e)}")


@router.get("/download/{file_key}")
async def download_file(
    file_key: str,
    file_service: FileService = Depends(get_file_service)
):
    """Download a file"""
    try:
        # Get file data
        storage_service = file_service.storage_service
        file_data = await storage_service.get(file_key)
        
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get file info for content type
        file_info = await file_service.get_file_info(file_key)
        content_type = file_info.get("content_type", "application/octet-stream") if file_info else "application/octet-stream"
        
        # Return file response using StreamingResponse
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        
        async def file_generator():
            with BytesIO(file_data) as buffer:
                while True:
                    chunk = buffer.read(8192)
                    if not chunk:
                        break
                    yield chunk
        
        return StreamingResponse(
            file_generator(),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={file_key}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.delete("/{file_key}", response_model=FileDeleteResponse)
async def delete_file(
    file_key: str,
    file_service: FileService = Depends(get_file_service)
):
    """Delete a file"""
    try:
        success = await file_service.delete_file(file_key)
        
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileDeleteResponse(file_key=file_key, deleted=True)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.get("/list")
async def list_files(
    file_service: FileService = Depends(get_file_service)
):
    """List all files (placeholder - would need storage service list implementation)"""
    # This would require implementing list functionality in storage service
    return JSONResponse(
        content={
            "message": "File listing not implemented yet",
            "files": []
        }
    )