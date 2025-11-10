"""Integration tests for Anki export functionality"""
import base64
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.schemas.export import DeckExportRequest, ImageOcclusionCard, OcclusionMask

client = TestClient(app)


class TestAnkiExport:
    """Test class for Anki export functionality"""
    
    def create_test_image(self, width=400, height=300, format="PNG") -> bytes:
        """Create a test image for testing"""
        img = Image.new('RGB', (width, height), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format)
        img_bytes.seek(0)
        return img_bytes.getvalue()
    
    def create_test_card(self, card_id: str = "test-card-1") -> ImageOcclusionCard:
        """Create a test card for testing"""
        # Create test image
        img_bytes = self.create_test_image()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        return ImageOcclusionCard(
            id=card_id,
            image_data=f"data:image/png;base64,{img_base64}",
            occlusions=[
                OcclusionMask(x=50, y=50, width=100, height=80, id="mask1"),
                OcclusionMask(x=200, y=100, width=60, height=60, id="mask2"),
            ],
            question="What is hidden in the red areas?",
            answer="Test content for the occluded areas",
            tags=["test", "sample"]
        )
    
    def create_test_deck(self, num_cards: int = 2) -> DeckExportRequest:
        """Create a test deck for testing"""
        cards = [self.create_test_card(f"card-{i}") for i in range(num_cards)]
        return DeckExportRequest(
            deck_name="Test Deck",
            deck_description="A test deck for unit testing",
            cards=cards,
            tags=["test-deck", "integration-test"]
        )
    
    def test_export_apkg_success(self):
        """Test successful .apkg export"""
        deck_request = self.create_test_deck()
        
        response = client.post("/api/v1/export/apkg", json=deck_request.model_dump())
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/octet-stream"
        assert "attachment; filename=" in response.headers["content-disposition"]
        assert "Test_Deck.apkg" in response.headers["content-disposition"]
        
        # Verify the response contains valid .apkg data
        apkg_data = response.content
        assert len(apkg_data) > 0
        
        # Validate zip structure
        with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
            files = zf.namelist()
            assert "collection" in files
            assert "media" in files
    
    def test_export_apkg_single_card(self):
        """Test .apkg export with a single card"""
        deck_request = self.create_test_deck(num_cards=1)
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        
        assert response.status_code == 200
        apkg_data = response.content
        
        # Validate the package
        with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
            files = zf.namelist()
            assert "collection" in files
            assert "media" in files
            
            # Check media content
            media_data = zf.read('media').decode('utf-8')
            # Should have at least one image entry
            assert len(media_data.strip()) > 0
    
    def test_export_apkg_multiple_cards(self):
        """Test .apkg export with multiple cards"""
        deck_request = self.create_test_deck(num_cards=5)
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        
        assert response.status_code == 200
        apkg_data = response.content
        
        # Validate the package
        with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
            files = zf.namelist()
            assert "collection" in files
            assert "media" in files
            
            # Check collection size is reasonable for 5 cards
            collection_data = zf.read('collection')
            assert len(collection_data) > 1000  # Should contain card data
    
    def test_export_validation_success(self):
        """Test successful validation of export request"""
        deck_request = self.create_test_deck()
        
        response = client.post("/api/v1/export/validate", json=deck_request.dict())
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["card_count"] == 2
        assert data["deck_name"] == "Test Deck"
        assert "message" in data
    
    def test_export_validation_no_cards(self):
        """Test validation failure with no cards"""
        deck_request = DeckExportRequest(
            deck_name="Empty Deck",
            cards=[]
        )
        
        response = client.post("/api/v1/export/validate", json=deck_request.dict())
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "At least one card is required" in data["error"]
    
    def test_export_validation_no_image(self):
        """Test validation failure with no image data"""
        card = ImageOcclusionCard(
            id="no-image-card",
            image_data="",
            image_path="",
            occlusions=[OcclusionMask(x=0, y=0, width=50, height=50, id="mask1")]
        )
        
        deck_request = DeckExportRequest(
            deck_name="No Image Deck",
            cards=[card]
        )
        
        response = client.post("/api/v1/export/validate", json=deck_request.dict())
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "must have either image_data or image_path" in data["error"]
    
    def test_export_validation_no_occlusions(self):
        """Test validation failure with no occlusions"""
        img_bytes = self.create_test_image()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        card = ImageOcclusionCard(
            id="no-occlusion-card",
            image_data=f"data:image/png;base64,{img_base64}",
            occlusions=[]
        )
        
        deck_request = DeckExportRequest(
            deck_name="No Occlusion Deck",
            cards=[card]
        )
        
        response = client.post("/api/v1/export/validate", json=deck_request.dict())
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "must have at least one occlusion" in data["error"]
    
    def test_export_invalid_image_data(self):
        """Test export with invalid image data"""
        card = ImageOcclusionCard(
            id="invalid-image-card",
            image_data="invalid-base64-data",
            occlusions=[OcclusionMask(x=0, y=0, width=50, height=50, id="mask1")]
        )
        
        deck_request = DeckExportRequest(
            deck_name="Invalid Image Deck",
            cards=[card]
        )
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        
        assert response.status_code == 400
        assert "Invalid image data" in response.json()["detail"]
    
    def test_export_info_endpoint(self):
        """Test the export info endpoint"""
        response = client.get("/api/v1/export/info")
        
        assert response.status_code == 200
        data = response.json()
        assert "supported_formats" in data
        assert "apkg" in data["supported_formats"]
        assert "model_id" in data
        assert "features" in data
        assert "limitations" in data
    
    def test_apkg_file_structure(self):
        """Test the structure of generated .apkg file"""
        deck_request = self.create_test_deck(num_cards=2)
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        assert response.status_code == 200
        
        apkg_data = response.content
        
        with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
            # Check required files exist
            assert "collection" in zf.namelist()
            assert "media" in zf.namelist()
            
            # Validate collection file is valid JSON-like structure
            try:
                collection_data = zf.read('collection')
                # Collection should contain our deck and cards
                collection_str = collection_data.decode('utf-8')
                assert len(collection_str) > 100  # Should have substantial content
            except Exception as e:
                pytest.fail(f"Invalid collection file: {e}")
            
            # Validate media file
            try:
                media_data = zf.read('media').decode('utf-8')
                # Media should map file numbers to filenames
                media_lines = media_data.strip().split('\n')
                # Should have at least some media entries
                assert len(media_lines) >= 1
            except Exception as e:
                pytest.fail(f"Invalid media file: {e}")
    
    def test_different_image_formats(self):
        """Test export with different image formats"""
        formats = ["PNG", "JPEG", "GIF"]
        
        for fmt in formats:
            # Create card with specific format
            img_bytes = self.create_test_image(format=fmt)
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            
            card = ImageOcclusionCard(
                id=f"test-{fmt.lower()}",
                image_data=f"data:image/{fmt.lower()};base64,{img_base64}",
                occlusions=[OcclusionMask(x=0, y=0, width=50, height=50, id="mask1")],
                question=f"Test with {fmt} image"
            )
            
            deck_request = DeckExportRequest(
                deck_name=f"Test {fmt} Deck",
                cards=[card]
            )
            
            response = client.post("/api/v1/export/apkg", json=deck_request.dict())
            assert response.status_code == 200
            
            # Verify the package is valid
            apkg_data = response.content
            with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
                assert "collection" in zf.namelist()
                assert "media" in zf.namelist()
    
    def test_large_deck_export(self):
        """Test export with a larger number of cards"""
        # Create a deck with 20 cards
        cards = []
        for i in range(20):
            img_bytes = self.create_test_image()
            img_base64 = base64.b64encode(img_bytes).decode('utf-8')
            
            card = ImageOcclusionCard(
                id=f"large-test-card-{i}",
                image_data=f"data:image/png;base64,{img_base64}",
                occlusions=[OcclusionMask(x=i*10, y=i*5, width=50, height=50, id=f"mask{i}")],
                question=f"Question {i}",
                answer=f"Answer {i}"
            )
            cards.append(card)
        
        deck_request = DeckExportRequest(
            deck_name="Large Test Deck",
            cards=cards,
            tags=["large-test"]
        )
        
        response = client.post("/api/v1/export/apkg", json=deck_request.dict())
        assert response.status_code == 200
        
        apkg_data = response.content
        assert len(apkg_data) > 5000  # Should be substantial for 20 cards
        
        # Validate structure
        with zipfile.ZipFile(io.BytesIO(apkg_data)) as zf:
            assert "collection" in zf.namelist()
            collection_data = zf.read('collection')
            assert len(collection_data) > 5000  # Should contain all 20 cards