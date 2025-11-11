"""OCR placeholder endpoints"""
from fastapi import APIRouter, status

router = APIRouter()


@router.get("/placeholder", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def ocr_placeholder():
    """OCR placeholder endpoint"""
    return {
        "message": "OCR endpoint not yet implemented",
        "feature": "ocr",
    }
