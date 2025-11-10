"""Pydantic schemas for Anki export functionality"""
from typing import List, Optional
from pydantic import BaseModel, Field


class OcclusionMask(BaseModel):
    """Schema for an occlusion mask"""
    x: int = Field(..., description="X coordinate of the mask")
    y: int = Field(..., description="Y coordinate of the mask")
    width: int = Field(..., description="Width of the mask")
    height: int = Field(..., description="Height of the mask")
    id: str = Field(..., description="Unique identifier for the mask")


class ImageOcclusionCard(BaseModel):
    """Schema for an image occlusion card"""
    id: str = Field(..., description="Unique identifier for the card")
    image_path: Optional[str] = Field(None, description="Path or URL to the image")
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    occlusions: List[OcclusionMask] = Field(..., description="List of occlusion masks")
    question: Optional[str] = Field(None, description="Additional question text")
    answer: Optional[str] = Field(None, description="Additional answer text")
    tags: List[str] = Field(default_factory=list, description="Tags for the card")


class DeckExportRequest(BaseModel):
    """Schema for deck export request"""
    deck_name: str = Field(..., description="Name of the deck")
    deck_description: Optional[str] = Field(None, description="Description of the deck")
    cards: List[ImageOcclusionCard] = Field(..., description="List of cards to export")
    tags: List[str] = Field(default_factory=list, description="Tags for the deck")


class ExportResponse(BaseModel):
    """Schema for export response"""
    success: bool = Field(..., description="Whether the export was successful")
    message: str = Field(..., description="Status message")
    deck_id: Optional[str] = Field(None, description="Generated deck ID")