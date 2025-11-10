"""API endpoints for Anki export functionality"""
import io
import tempfile
import os
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse

from app.schemas.export import DeckExportRequest, ExportResponse
from app.services.anki_export import AnkiExportService

router = APIRouter()
export_service = AnkiExportService()


@router.post("/export/apkg")
async def export_deck_to_apkg(request: DeckExportRequest):
    """Export a deck to Anki .apkg format"""
    try:
        # Generate .apkg file
        apkg_bytes, metadata = export_service.generate_apkg(request)
        
        # Validate the generated file
        validation = export_service.validate_apkg(apkg_bytes)
        if not validation["valid"]:
            raise HTTPException(
                status_code=500,
                detail=f"Generated .apkg file is invalid: {validation.get('error', 'Unknown error')}"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.apkg') as tmp_file:
            tmp_file.write(apkg_bytes)
            tmp_file.flush()
            
            # Return file response
            filename = f"{request.deck_name.replace(' ', '_')}.apkg"
            
            def cleanup():
                try:
                    os.unlink(tmp_file.name)
                except:
                    pass
            
            return Response(
                content=apkg_bytes,
                media_type="application/octet-stream",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/export/validate", response_model=dict)
async def validate_export_request(request: DeckExportRequest):
    """Validate an export request without generating the file"""
    try:
        # Basic validation
        if not request.cards:
            raise ValueError("At least one card is required")
        
        for card in request.cards:
            if not card.image_data and not card.image_path:
                raise ValueError(f"Card {card.id} must have either image_data or image_path")
            
            if not card.occlusions:
                raise ValueError(f"Card {card.id} must have at least one occlusion")
        
        return {
            "valid": True,
            "card_count": len(request.cards),
            "deck_name": request.deck_name,
            "message": "Export request is valid"
        }
        
    except ValueError as e:
        return {
            "valid": False,
            "error": str(e)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation error: {str(e)}")


@router.get("/export/info")
async def get_export_info():
    """Get information about the export functionality"""
    return {
        "supported_formats": ["apkg"],
        "model_id": export_service.IMAGE_OCCLUSION_MODEL_ID,
        "features": [
            "Image occlusion cards",
            "Media bundling",
            "Custom tags",
            "Deck metadata"
        ],
        "limitations": {
            "max_cards_per_deck": 1000,
            "max_image_size": "10MB",
            "supported_image_formats": ["jpg", "jpeg", "png", "gif", "webp"]
        }
    }