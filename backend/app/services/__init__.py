"""Business logic services"""

from datetime import datetime
from typing import List, Dict, Any
import uuid

from app.schemas import (
    SubmissionStatusEnum,
    SubmissionResponseSchema,
    CardSchema,
    OcclusionSchema,
    OcclusionType,
)


class SubmissionService:
    """Service for managing submissions"""

    # In-memory storage for MVP (replace with database later)
    _submissions: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def create_submission(cls, filename: str, file_size: int) -> SubmissionResponseSchema:
        """Create a new submission"""
        submission_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        submission = {
            "id": submission_id,
            "filename": filename,
            "status": SubmissionStatusEnum.UPLOADED,
            "cards": [],
            "created_at": now,
            "updated_at": now,
            "file_size": file_size,
        }

        cls._submissions[submission_id] = submission
        return SubmissionResponseSchema(**submission)

    @classmethod
    def get_submission(cls, submission_id: str) -> SubmissionResponseSchema:
        """Get a submission by ID"""
        if submission_id not in cls._submissions:
            raise ValueError(f"Submission {submission_id} not found")

        return SubmissionResponseSchema(**cls._submissions[submission_id])

    @classmethod
    def generate_cards(
        cls, submission_id: str, num_cards: int = 3
    ) -> SubmissionResponseSchema:
        """Generate cards from OCR"""
        submission = cls._submissions.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        # Mock card generation
        cards = []
        for i in range(num_cards):
            occlusions = [
                OcclusionSchema(
                    id=str(uuid.uuid4()),
                    type=OcclusionType.RECTANGLE,
                    coordinates=[10 + i * 50, 20, 100, 50],
                    text=f"term_{i}",
                )
            ]

            card = CardSchema(
                id=str(uuid.uuid4()),
                image_url=f"/api/submissions/{submission_id}/image",
                occlusions=occlusions,
                front_text=f"Question {i+1}",
                back_text=f"Answer {i+1}",
                approved=False,
            )
            cards.append(card)

        submission["cards"] = [card.dict() for card in cards]
        submission["status"] = SubmissionStatusEnum.GENERATED
        submission["updated_at"] = datetime.utcnow().isoformat()

        return SubmissionResponseSchema(**submission)

    @classmethod
    def approve_submission(
        cls, submission_id: str, cards: List[CardSchema]
    ) -> SubmissionResponseSchema:
        """Approve and update cards for a submission"""
        submission = cls._submissions.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        submission["cards"] = [card.dict() for card in cards]
        submission["status"] = SubmissionStatusEnum.APPROVED
        submission["updated_at"] = datetime.utcnow().isoformat()

        return SubmissionResponseSchema(**submission)

    @classmethod
    def export_submission(cls, submission_id: str) -> str:
        """Export submission as .apkg"""
        submission = cls._submissions.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        # Mock APKG generation (return a data URI for MVP)
        submission["status"] = SubmissionStatusEnum.EXPORTED
        submission["updated_at"] = datetime.utcnow().isoformat()

        # Return mock .apkg file content (base64 encoded zip)
        return "UEsDBAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLAQIUAAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLBQY="

    @classmethod
    def clear_submissions(cls):
        """Clear all submissions (for testing)"""
        cls._submissions.clear()
