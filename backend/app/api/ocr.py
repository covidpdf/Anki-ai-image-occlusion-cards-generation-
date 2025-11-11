"""OCR router (placeholder)"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.get("/placeholder")
async def placeholder():
    """Placeholder endpoint for OCR functionality"""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "OCR functionality not yet implemented"},
    )
