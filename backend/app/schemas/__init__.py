"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class SubmissionStatusEnum(str, Enum):
    """Status enum for submissions"""

    UPLOADED = "uploaded"
    PROCESSING = "processing"
    GENERATED = "generated"
    APPROVED = "approved"
    EXPORTED = "exported"


class OcclusionType(str, Enum):
    """Types of occlusions"""

    RECTANGLE = "rectangle"
    ELLIPSE = "ellipse"
    POLYGON = "polygon"


class OcclusionSchema(BaseModel):
    """Schema for a single occlusion"""

    id: Optional[str] = None
    type: OcclusionType
    coordinates: List[float]  # x, y, width, height for rectangle
    text: Optional[str] = None


class CardSchema(BaseModel):
    """Schema for a generated card"""

    id: Optional[str] = None
    image_url: str
    occlusions: List[OcclusionSchema]
    front_text: str
    back_text: str
    approved: bool = False


class SubmissionCreateSchema(BaseModel):
    """Schema for creating a submission"""

    filename: str
    file_size: int


class SubmissionResponseSchema(BaseModel):
    """Schema for submission response"""

    id: str
    filename: str
    status: SubmissionStatusEnum
    cards: List[CardSchema] = []
    created_at: str
    updated_at: str


class SubmissionApproveSchema(BaseModel):
    """Schema for approving/updating submission"""

    cards: List[CardSchema]
    notes: Optional[str] = None
