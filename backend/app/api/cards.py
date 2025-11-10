"""Card generation API endpoints"""
import logging

from fastapi import APIRouter, HTTPException

from app.schemas.cards import CardGenerationRequest, CardGenerationResponse
from app.services.card_generator import CardGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cards", tags=["cards"])

# Initialize the card generator
card_generator = CardGenerator()


@router.post("/generate", response_model=CardGenerationResponse)
async def generate_cards(request: CardGenerationRequest) -> CardGenerationResponse:
    """
    Generate flashcards from OCR text and occlusion regions

    Args:
        request: Card generation request containing OCR text, occlusions, and prompt

    Returns:
        Generated cards with confidence metrics
    """
    try:
        if not request.occlusions:
            raise HTTPException(
                status_code=400,
                detail="At least one occlusion region must be provided",
            )

        if request.card_type == "cloze":
            cards = card_generator.generate_cloze_cards(
                request.ocr_text, request.occlusions, request.user_prompt
            )
        elif request.card_type == "qa":
            cards = card_generator.generate_qa_cards(
                request.ocr_text, request.occlusions, request.user_prompt
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown card type: {request.card_type}",
            )

        if not cards:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate any cards",
            )

        summary = card_generator.summarize_text(request.ocr_text)
        avg_confidence = card_generator.calculate_average_confidence(cards)

        response = CardGenerationResponse(
            cards=cards,
            ocr_text_summary=summary,
            total_confidence=avg_confidence,
        )

        logger.info(f"Generated {len(cards)} {request.card_type} cards")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating cards: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cards: {str(e)}",
        )


@router.get("/health")
async def cards_health():
    """Health check endpoint for card generation service"""
    cached_models = card_generator.model_manager.get_cached_models()
    return {
        "status": "healthy",
        "service": "card-generation",
        "cached_models": cached_models,
    }
