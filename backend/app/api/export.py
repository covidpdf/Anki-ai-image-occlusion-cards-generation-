"""Export placeholder endpoints"""
from fastapi import APIRouter, status

router = APIRouter()


@router.get("/placeholder", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def export_placeholder():
    """Export placeholder endpoint"""
    return {
        "message": "Export endpoint not yet implemented",
        "feature": "export",
    }
