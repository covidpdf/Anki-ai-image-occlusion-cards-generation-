"""OCR API endpoints"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.ocr import OCRSubmissionRequest, OCRSubmissionResponse
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/api/ocr")


@router.post("/submit", response_model=OCRSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_ocr(request: OCRSubmissionRequest) -> OCRSubmissionResponse:
    """
    Submit OCR results for processing.

    This endpoint receives raw OCR text and metadata from the frontend
    for later AI processing and Anki card generation.
    """
    try:
        result = ocr_service.process_submission(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process OCR submission: {str(e)}",
        )


@router.get("/submissions/{submission_id}")
async def get_submission(submission_id: str):
    """Retrieve a specific OCR submission"""
    submission = ocr_service.get_submission(submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )
    return submission


@router.get("/submissions")
async def list_submissions():
    """List all OCR submissions"""
    submissions = ocr_service.get_all_submissions()
    return {"submissions": submissions, "count": len(submissions)}
