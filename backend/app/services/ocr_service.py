"""OCR processing service"""
import uuid
from datetime import datetime, timezone
from typing import List

from app.schemas.ocr import (
    OCRPageSubmission,
    OCRSubmissionRequest,
    OCRSubmissionResponse,
)


class OCRService:
    """Service for handling OCR submissions"""

    def __init__(self):
        self.submissions = {}

    def process_submission(
        self, request: OCRSubmissionRequest
    ) -> OCRSubmissionResponse:
        """Process an OCR submission"""
        submission_id = str(uuid.uuid4())

        total_confidence = sum(page.confidence for page in request.pages) / len(
            request.pages
        )

        submission = OCRSubmissionResponse(
            id=submission_id,
            filename=request.filename,
            pageCount=len(request.pages),
            totalConfidence=total_confidence,
            createdAt=datetime.now(timezone.utc),
        )

        self.submissions[submission_id] = {
            "request": request,
            "response": submission,
        }

        return submission

    def get_submission(self, submission_id: str) -> dict | None:
        """Retrieve a submission by ID"""
        return self.submissions.get(submission_id)

    def get_all_submissions(self) -> List[dict]:
        """Retrieve all submissions"""
        return list(self.submissions.values())


ocr_service = OCRService()
