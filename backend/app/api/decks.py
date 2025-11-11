"""Decks router (placeholder)"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/decks", tags=["decks"])


@router.get("/placeholder")
async def placeholder():
    """Placeholder endpoint for deck management functionality"""
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"message": "Deck management functionality not yet implemented"},
    )
