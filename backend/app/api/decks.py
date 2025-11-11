"""Deck management placeholder endpoints"""
from fastapi import APIRouter, status

router = APIRouter()


@router.get("/placeholder", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def decks_placeholder():
    """Deck creation placeholder endpoint"""
    return {
        "message": "Deck management not yet implemented",
        "feature": "decks",
    }
