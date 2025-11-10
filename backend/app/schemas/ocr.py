"""OCR-related Pydantic schemas"""
from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class OCRPageSubmission(BaseModel):
    """Schema for a single page OCR submission"""

    model_config = ConfigDict(populate_by_name=True)

    page_number: int = Field(..., description="Page number", ge=1, alias="pageNumber")
    text: str = Field(..., description="OCR extracted text")
    confidence: float = Field(
        ..., description="OCR confidence score", ge=0.0, le=100.0
    )


class OCRSubmissionRequest(BaseModel):
    """Schema for OCR submission request"""

    model_config = ConfigDict(populate_by_name=True)

    filename: str = Field(..., description="Original filename", min_length=1)
    pages: List[OCRPageSubmission] = Field(
        ..., description="List of OCR pages", min_length=1
    )


class OCRSubmissionResponse(BaseModel):
    """Schema for OCR submission response"""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique submission ID")
    filename: str = Field(..., description="Original filename")
    page_count: int = Field(..., description="Number of pages processed", alias="pageCount")
    total_confidence: float = Field(
        ..., description="Average confidence across all pages", alias="totalConfidence"
    )
    created_at: datetime = Field(..., description="Submission timestamp", alias="createdAt")
