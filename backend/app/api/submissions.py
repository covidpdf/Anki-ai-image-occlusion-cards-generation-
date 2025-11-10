"""Submissions API endpoints"""

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from typing import List

from app.schemas import (
    SubmissionCreateSchema,
    SubmissionResponseSchema,
    SubmissionApproveSchema,
    CardSchema,
)
from app.services import SubmissionService

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_submission(file: UploadFile = File(...)) -> SubmissionResponseSchema:
    """Create a new submission with PDF file upload"""
    try:
        # For MVP, we'll just validate the file exists and get its size
        # In production, you would save the file and perform OCR
        contents = await file.read()
        file_size = len(contents)

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must have a filename",
            )

        submission = SubmissionService.create_submission(
            filename=file.filename,
            file_size=file_size,
        )
        return submission
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{submission_id}", response_model=SubmissionResponseSchema)
async def get_submission(submission_id: str) -> SubmissionResponseSchema:
    """Get submission details"""
    try:
        submission = SubmissionService.get_submission(submission_id)
        return submission
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/{submission_id}/generate", response_model=SubmissionResponseSchema)
async def generate_cards(submission_id: str) -> SubmissionResponseSchema:
    """Generate cards using AI/OCR"""
    try:
        submission = SubmissionService.generate_cards(submission_id)
        return submission
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.patch("/{submission_id}/approve", response_model=SubmissionResponseSchema)
async def approve_submission(
    submission_id: str, payload: SubmissionApproveSchema
) -> SubmissionResponseSchema:
    """Approve and update cards"""
    try:
        submission = SubmissionService.approve_submission(submission_id, payload.cards)
        return submission
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/{submission_id}/export")
async def export_submission(submission_id: str):
    """Export submission as .apkg file"""
    try:
        apkg_data = SubmissionService.export_submission(submission_id)
        return {
            "submission_id": submission_id,
            "download_url": f"/api/submissions/{submission_id}/download",
            "filename": f"deck_{submission_id}.apkg",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/{submission_id}/download")
async def download_submission(submission_id: str):
    """Download .apkg file"""
    try:
        SubmissionService.get_submission(submission_id)
        # In production, generate or retrieve the actual .apkg file
        apkg_data = SubmissionService.export_submission(submission_id)

        return {
            "status": "success",
            "data": apkg_data,
            "filename": f"deck_{submission_id}.apkg",
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
