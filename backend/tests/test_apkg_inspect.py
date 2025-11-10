"""Advanced validation tests using anki-apkg-inspect"""
import base64
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.schemas.export import DeckExportRequest, ImageOcclusionCard, OcclusionMask

client = TestClient(app)


class TestAnkiApkgInspect:
    """Test class for advanced .apkg validation using anki-apkg-inspect"""
    
    def create_test_image(self, width=400, height=300, format="PNG") -> bytes:
        """Create a test image for testing"""
        img = Image.new('RGB', (width, height), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format)
        img_bytes.seek(0)
        return img_bytes.getvalue()
    
    def create_test_card(self, card_id: str = "inspect-test-card") -> ImageOcclusionCard:
        """Create a test card for inspection testing"""
        img_bytes = self.create_test_image()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        return ImageOcclusionCard(
            id=card_id,
            image_data=f"data:image/png;base64,{img_base64}",
            occlusions=[
                OcclusionMask(x=100, y=100, width=80, height=60, id="inspect-mask-1"),
                OcclusionMask(x=250, y=150, width=100, height=80, id="inspect-mask-2"),
            ],
            question="What areas are occluded in this image?",
            answer="The blue rectangular areas are the occluded regions",
            tags=["inspect-test", "validation"]
        )
    
    def generate_test_apkg(self, deck_name: str = "Inspect Test Deck") -> bytes:
        """Generate a test .apkg file for inspection"""
        card = self.create_test_card()
        deck_request = DeckExportRequest(
            deck_name=deck_name,
            deck_description="Deck for anki-apkg-inspect testing",
            cards=[card],
            tags=["inspect-test-deck"]
        )
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        assert response.status_code == 200
        return response.content
    
    def test_apkg_basic_structure_validation(self):
        """Test basic .apkg structure validation"""
        apkg_data = self.generate_test_apkg()
        
        # Basic file checks
        assert len(apkg_data) > 1000  # Should be substantial
        assert apkg_data.startswith(b'PK')  # Should be a zip file
        
        # Import anki-apkg-inspect if available
        try:
            import tempfile
            import os
            from apkg_inspect import inspect_apkg
            
            # Write to temporary file for inspection
            with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as tmp_file:
                tmp_file.write(apkg_data)
                tmp_file.flush()
                
                try:
                    # Inspect the .apkg file
                    result = inspect_apkg(tmp_file.name)
                    
                    # Basic validation of inspection results
                    assert result is not None
                    assert hasattr(result, 'decks')
                    assert hasattr(result, 'notes')
                    assert hasattr(result, 'media')
                    
                    # Check that we have at least one deck
                    assert len(result.decks) > 0
                    
                    # Check that we have at least one note
                    assert len(result.notes) > 0
                    
                    # Verify deck name
                    deck_names = [deck.name for deck in result.decks]
                    assert "Inspect Test Deck" in deck_names
                    
                finally:
                    # Clean up temporary file
                    os.unlink(tmp_file.name)
                    
        except ImportError:
            # If anki-apkg-inspect is not available, skip this test
            pytest.skip("anki-apkg-inspect not available")
    
    def test_apkg_content_validation(self):
        """Test .apkg content validation"""
        apkg_data = self.generate_test_apkg()
        
        try:
            import tempfile
            import os
            from apkg_inspect import inspect_apkg
            
            with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as tmp_file:
                tmp_file.write(apkg_data)
                tmp_file.flush()
                
                try:
                    result = inspect_apkg(tmp_file.name)
                    
                    # Validate notes structure
                    assert len(result.notes) > 0
                    note = result.notes[0]
                    
                    # Check that note has expected fields
                    assert hasattr(note, 'fields')
                    assert len(note.fields) >= 3  # Should have at least Question, Answer, Image
                    
                    # Check field content
                    field_names = [field.name for field in note.fields if hasattr(field, 'name')]
                    # Should contain our custom fields
                    assert any('question' in name.lower() for name in field_names)
                    assert any('answer' in name.lower() for name in field_names)
                    
                    # Validate media
                    assert hasattr(result, 'media')
                    # Should have at least one image file
                    assert len(result.media) > 0
                    
                finally:
                    os.unlink(tmp_file.name)
                    
        except ImportError:
            pytest.skip("anki-apkg-inspect not available")
    
    def test_multiple_cards_apkg_validation(self):
        """Test .apkg validation with multiple cards"""
        # Create multiple cards
        cards = []
        for i in range(3):
            img_bytes = self.create_test_image()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            
            card = ImageOcclusionCard(
                id=f"multi-card-{i}",
                image_data=f"data:image/png;base64,{img_base64}",
                occlusions=[
                    OcclusionMask(x=i*50, y=i*30, width=60, height=40, id=f"mask-{i}")
                ],
                question=f"Multi-card question {i}",
                answer=f"Multi-card answer {i}",
                tags=[f"tag-{i}", "multi-test"]
            )
            cards.append(card)
        
        deck_request = DeckExportRequest(
            deck_name="Multi Card Test Deck",
            cards=cards,
            tags=["multi-card-deck"]
        )
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        assert response.status_code == 200
        apkg_data = response.content
        
        try:
            import tempfile
            import os
            from apkg_inspect import inspect_apkg
            
            with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as tmp_file:
                tmp_file.write(apkg_data)
                tmp_file.flush()
                
                try:
                    result = inspect_apkg(tmp_file.name)
                    
                    # Should have 3 notes
                    assert len(result.notes) == 3
                    
                    # Should have 3 media files (one per card)
                    assert len(result.media) >= 3
                    
                    # Validate each note
                    for i, note in enumerate(result.notes):
                        assert len(note.fields) >= 3
                        # Check that questions are different
                        question_field = next((f for f in note.fields if 'question' in f.name.lower()), None)
                        if question_field:
                            assert f"Multi-card question {i}" in question_field.value or str(i) in question_field.value
                            
                finally:
                    os.unlink(tmp_file.name)
                    
        except ImportError:
            pytest.skip("anki-apkg-inspect not available")
    
    def test_apkg_model_validation(self):
        """Test that our custom model is correctly applied"""
        apkg_data = self.generate_test_apkg()
        
        try:
            import tempfile
            import os
            from apkg_inspect import inspect_apkg
            
            with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as tmp_file:
                tmp_file.write(apkg_data)
                tmp_file.flush()
                
                try:
                    result = inspect_apkg(tmp_file.name)
                    
                    # Check models
                    assert hasattr(result, 'models')
                    assert len(result.models) > 0
                    
                    # Find our image occlusion model
                    occlusion_model = None
                    for model in result.models:
                        if 'occlusion' in model.name.lower() or 'image' in model.name.lower():
                            occlusion_model = model
                            break
                    
                    assert occlusion_model is not None, "Image occlusion model not found"
                    
                    # Check model fields
                    field_names = [field.name for field in occlusion_model.fields]
                    expected_fields = ['Question', 'Answer', 'Image', 'Occlusions', 'Tags']
                    
                    for expected_field in expected_fields:
                        assert any(expected_field in name for name in field_names), f"Field {expected_field} not found"
                    
                    # Check model templates
                    assert len(occlusion_model.templates) > 0
                    
                finally:
                    os.unlink(tmp_file.name)
                    
        except ImportError:
            pytest.skip("anki-apkg-inspect not available")
    
    def test_apkg_tag_validation(self):
        """Test that tags are correctly applied"""
        apkg_data = self.generate_test_apkg("Tag Test Deck")
        
        try:
            import tempfile
            import os
            from apkg_inspect import inspect_apkg
            
            with tempfile.NamedTemporaryFile(suffix='.apkg', delete=False) as tmp_file:
                tmp_file.write(apkg_data)
                tmp_file.flush()
                
                try:
                    result = inspect_apkg(tmp_file.name)
                    
                    # Check note tags
                    assert len(result.notes) > 0
                    note = result.notes[0]
                    
                    # Should have our test tags
                    if hasattr(note, 'tags'):
                        note_tags = [tag.lower() for tag in note.tags]
                        assert 'inspect-test' in note_tags or 'validation' in note_tags
                        
                finally:
                    os.unlink(tmp_file.name)
                    
        except ImportError:
            pytest.skip("anki-apkg-inspect not available")