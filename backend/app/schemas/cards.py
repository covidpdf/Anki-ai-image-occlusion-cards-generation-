"""Schemas for card generation API"""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class OcclusionRegion(BaseModel):
    """Represents an occlusion region in the image"""

    x: float = Field(..., description="X coordinate of the region")
    y: float = Field(..., description="Y coordinate of the region")
    width: float = Field(..., description="Width of the region")
    height: float = Field(..., description="Height of the region")
    text: Optional[str] = Field(None, description="Text within the region")


class CardGenerationRequest(BaseModel):
    """Request schema for card generation"""

    ocr_text: str = Field(..., description="Full OCR text extracted from the image")
    occlusions: list[OcclusionRegion] = Field(
        ..., description="List of occlusion regions with text"
    )
    user_prompt: Optional[str] = Field(
        None, description="Optional user-provided prompt for card generation"
    )
    card_type: str = Field(
        default="cloze",
        description="Type of card: 'cloze' for cloze deletion, 'qa' for question/answer",
    )


class CardContent(BaseModel):
    """Generated card content"""

    front: str = Field(..., description="Front side of the card")
    back: str = Field(..., description="Back side of the card")


class GeneratedCard(BaseModel):
    """A single generated card with confidence metrics"""

    model_config = ConfigDict(protected_namespaces=())

    content: CardContent
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0-1.0)")
    model_used: str = Field(..., description="Name of the model used")
    reasoning: Optional[str] = Field(
        None, description="Reasoning or explanation for the generated card"
    )


class CardGenerationResponse(BaseModel):
    """Response schema for card generation"""

    cards: list[GeneratedCard] = Field(..., description="List of generated cards")
    ocr_text_summary: Optional[str] = Field(None, description="Summary of the OCR text")
    total_confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Average confidence across all cards"
    )


class CardReviewRequest(BaseModel):
    """Request schema for card review/approval"""

    card_id: str = Field(..., description="ID of the card being reviewed")
    approved: bool = Field(..., description="Whether the card is approved")
    corrections: Optional[str] = Field(None, description="Corrected content if user made changes")
    notes: Optional[str] = Field(None, description="User notes on the card")
