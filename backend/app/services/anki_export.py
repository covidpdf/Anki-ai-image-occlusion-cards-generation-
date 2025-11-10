"""Service for generating Anki .apkg packages using genanki"""
import base64
import io
import random
import zipfile
from typing import List, Tuple, Dict, Any
import genanki
from PIL import Image

from app.schemas.export import ImageOcclusionCard, DeckExportRequest


class AnkiExportService:
    """Service for exporting decks to Anki .apkg format"""
    
    # Model ID for image occlusion cards (random but consistent)
    IMAGE_OCCLUSION_MODEL_ID = 1607392319
    
    def __init__(self):
        """Initialize the export service"""
        self._create_occlusion_model()
    
    def _create_occlusion_model(self) -> None:
        """Create the Anki model for image occlusion cards"""
        self.occlusion_model = genanki.Model(
            self.IMAGE_OCCLUSION_MODEL_ID,
            'Image Occlusion Card',
            fields=[
                {'name': 'Question'},
                {'name': 'Answer'},
                {'name': 'Image'},
                {'name': 'Occlusions'},
                {'name': 'Tags'},
            ],
            templates=[
                {
                    'name': 'Image Occlusion',
                    'qfmt': '{{Question}}<br>{{Image}}<br>{{Occlusions}}',
                    'afmt': '{{Answer}}<br>{{Image}}<br>{{Tags}}',
                },
            ]
        )
    
    def _process_image_data(self, card: ImageOcclusionCard) -> Tuple[str, bytes]:
        """Process image data and return filename and image bytes"""
        if card.image_data:
            # Handle base64 encoded image data
            try:
                # Remove data URL prefix if present
                if card.image_data.startswith('data:'):
                    # Find the comma separator
                    comma_idx = card.image_data.find(',')
                    if comma_idx != -1:
                        base64_data = card.image_data[comma_idx + 1:]
                    else:
                        base64_data = card.image_data
                else:
                    base64_data = card.image_data
                
                image_bytes = base64.b64decode(base64_data)
                
                # Try to determine image format from the data
                with Image.open(io.BytesIO(image_bytes)) as img:
                    format_ext = img.format.lower() if img.format else 'png'
                    if format_ext not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                        format_ext = 'png'
                
                filename = f"{card.id}.{format_ext}"
                return filename, image_bytes
                
            except Exception as e:
                raise ValueError(f"Invalid image data for card {card.id}: {e}")
        
        elif card.image_path:
            # For now, assume image_path is a filename that will be provided
            # In a real implementation, you might fetch from URL or local storage
            filename = card.image_path.split('/')[-1]
            return filename, b''  # Placeholder - actual image would be loaded
        
        else:
            raise ValueError(f"No image data or path provided for card {card.id}")
    
    def _generate_occlusion_html(self, card: ImageOcclusionCard) -> str:
        """Generate HTML for occlusion masks"""
        occlusions_html = []
        for occlusion in card.occlusions:
            occlusions_html.append(
                f'<div class="occlusion" style="position: absolute; left: {occlusion.x}px; '
                f'top: {occlusion.y}px; width: {occlusion.width}px; height: {occlusion.height}px; '
                f'background-color: rgba(0, 0, 0, 0.8); border: 2px solid #333;"></div>'
            )
        return ''.join(occlusions_html)
    
    def _create_note(self, card: ImageOcclusionCard) -> genanki.Note:
        """Create an Anki note from a card"""
        try:
            # Process image
            image_filename, image_bytes = self._process_image_data(card)
            
            # Generate occlusion HTML
            occlusions_html = self._generate_occlusion_html(card)
            
            # Combine tags
            all_tags = card.tags + [f"occlusion_{card.id}"]
            tags_str = ' '.join(all_tags)
            
            # Create note
            note = genanki.Note(
                model=self.occlusion_model,
                fields=[
                    card.question or "Identify the occluded areas",
                    card.answer or "Revealed areas",
                    f'<img src="{image_filename}" alt="Question Image">',
                    occlusions_html,
                    tags_str
                ],
                tags=all_tags
            )
            
            return note, image_filename, image_bytes
            
        except Exception as e:
            raise ValueError(f"Error processing card {card.id}: {e}")
    
    def generate_apkg(self, request: DeckExportRequest) -> Tuple[bytes, Dict[str, Any]]:
        """Generate an .apkg file from the deck request"""
        # Create a unique deck ID
        deck_id = random.randrange(1 << 30, 1 << 31)
        
        # Create the deck
        deck = genanki.Deck(
            deck_id,
            request.deck_name,
            description=request.deck_description or ""
        )
        
        # Process cards and collect media files
        notes = []
        media_files = {}  # filename -> bytes
        
        for card in request.cards:
            try:
                note, image_filename, image_bytes = self._create_note(card)
                notes.append(note)
                
                # Add to media files if not empty
                if image_bytes and image_filename not in media_files:
                    media_files[image_filename] = image_bytes
                    
            except Exception as e:
                raise ValueError(f"Error processing card {card.id}: {e}")
        
        # Add notes to deck
        for note in notes:
            deck.add_note(note)
        
        # Generate the .apkg file
        package = genanki.Package(deck)
        
        # Add media files - write to temp files for genanki
        if media_files:
            import tempfile
            media_file_paths = []
            for filename, content in media_files.items():
                if isinstance(content, bytes):
                    # Write to temporary file
                    with tempfile.NamedTemporaryFile(delete=False, suffix=f'_{filename}') as tmp_file:
                        tmp_file.write(content)
                        media_file_paths.append(tmp_file.name)
                else:
                    media_file_paths.append(content)
            package.media_files = media_file_paths
        
        # Write to bytes buffer
        output = io.BytesIO()
        package.write_to_file(output)
        output.seek(0)
        
        # Prepare metadata
        metadata = {
            "deck_id": str(deck_id),
            "deck_name": request.deck_name,
            "card_count": len(notes),
            "media_count": len(media_files),
            "tags": request.tags
        }
        
        return output.getvalue(), metadata
    
    def validate_apkg(self, apkg_bytes: bytes) -> Dict[str, Any]:
        """Validate an .apkg file and return metadata"""
        try:
            # Read the zip file
            with zipfile.ZipFile(io.BytesIO(apkg_bytes)) as zf:
                # Check for required files - genanki may create collection.anki2
                required_files = ['collection']
                actual_files = zf.namelist()
                
                # Look for any collection file
                collection_files = [f for f in actual_files if f.startswith('collection')]
                if not collection_files:
                    return {
                        "valid": False,
                        "error": f"Missing collection file. Found files: {actual_files}",
                        "files": actual_files
                    }
                
                # Check for media file
                media_files = [f for f in actual_files if f == 'media']
                if not media_files:
                    return {
                        "valid": False,
                        "error": f"Missing media file. Found files: {actual_files}",
                        "files": actual_files
                    }
                
                # Read collection (basic validation)
                collection_data = zf.read(collection_files[0])
                
                # Read media mapping
                try:
                    media_data = zf.read('media').decode('utf-8')
                    media_lines = media_data.split('\n')
                    media_count = len([line for line in media_lines if line.strip()])
                except:
                    media_count = 0
                
                return {
                    "valid": True,
                    "files": actual_files,
                    "collection_size": len(collection_data),
                    "media_count": media_count,
                    "total_size": len(apkg_bytes)
                }
                
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }