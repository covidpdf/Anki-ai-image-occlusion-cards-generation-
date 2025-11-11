"""Export router (placeholder)"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/placeholder")
async def placeholder():
    """Placeholder endpoint for export functionality"""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Export functionality not yet implemented"},
    )
