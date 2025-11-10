"""Contract tests for card generation API"""
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.cards import CardContent, GeneratedCard

client = TestClient(app)


class TestCardGenerationAPI:
    """Contract tests for card generation endpoints"""

    def test_cards_health_endpoint(self):
        """Test cards health check endpoint"""
        response = client.get("/api/cards/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "service" in data
        assert "cached_models" in data

    @patch("app.api.cards.card_generator.generate_cloze_cards")
    def test_generate_cards_cloze_type(self, mock_generate_cloze):
        """Test cloze card generation endpoint"""
        mock_card = GeneratedCard(
            content=CardContent(front="The capital of France is ___", back="Paris"),
            confidence=0.88,
            model_used="google/flan-t5-base",
            reasoning="Test cloze card",
        )
        mock_generate_cloze.return_value = [mock_card]

        request_payload = {
            "ocr_text": "The capital of France is Paris.",
            "occlusions": [{"x": 10, "y": 10, "width": 100, "height": 50, "text": "Paris"}],
            "card_type": "cloze",
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert "ocr_text_summary" in data
        assert "total_confidence" in data

    @patch("app.api.cards.card_generator.generate_qa_cards")
    def test_generate_cards_qa_type(self, mock_generate_qa):
        """Test Q&A card generation endpoint"""
        mock_card = GeneratedCard(
            content=CardContent(front="What is the capital of France?", back="Paris"),
            confidence=0.85,
            model_used="google/flan-t5-base",
            reasoning="Test Q&A card",
        )
        mock_generate_qa.return_value = [mock_card]

        request_payload = {
            "ocr_text": "The capital of France is Paris.",
            "occlusions": [{"x": 10, "y": 10, "width": 100, "height": 50, "text": "Paris"}],
            "card_type": "qa",
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200
        data = response.json()
        assert "cards" in data
        assert len(data["cards"]) > 0

    def test_generate_cards_missing_occlusions(self):
        """Test card generation with missing occlusions"""
        request_payload = {"ocr_text": "The capital of France is Paris.", "occlusions": []}

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_generate_cards_invalid_card_type(self):
        """Test card generation with invalid card type"""
        request_payload = {
            "ocr_text": "The capital of France is Paris.",
            "occlusions": [{"x": 10, "y": 10, "width": 100, "height": 50, "text": "Paris"}],
            "card_type": "invalid_type",
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    @patch("app.api.cards.card_generator.generate_cloze_cards")
    def test_generate_cards_response_structure(self, mock_generate_cloze):
        """Test response structure compliance"""
        mock_card = GeneratedCard(
            content=CardContent(front="Front", back="Back"),
            confidence=0.85,
            model_used="google/flan-t5-base",
        )
        mock_generate_cloze.return_value = [mock_card]

        request_payload = {
            "ocr_text": "Some OCR text.",
            "occlusions": [{"x": 0, "y": 0, "width": 100, "height": 100, "text": "Some text"}],
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data["cards"], list)
        for card in data["cards"]:
            assert "content" in card
            assert "front" in card["content"]
            assert "back" in card["content"]
            assert "confidence" in card
            assert 0.0 <= card["confidence"] <= 1.0
            assert "model_used" in card

        assert isinstance(data["total_confidence"], float)
        assert 0.0 <= data["total_confidence"] <= 1.0

    @patch("app.api.cards.card_generator.generate_cloze_cards")
    def test_generate_cards_with_user_prompt(self, mock_generate_cloze):
        """Test card generation with user prompt"""
        mock_card = GeneratedCard(
            content=CardContent(front="Front", back="Back"),
            confidence=0.85,
            model_used="google/flan-t5-base",
        )
        mock_generate_cloze.return_value = [mock_card]

        request_payload = {
            "ocr_text": "Scientific content here.",
            "occlusions": [{"x": 0, "y": 0, "width": 100, "height": 100, "text": "photosynthesis"}],
            "user_prompt": "Focus on biology concepts",
            "card_type": "cloze",
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200

    def test_generate_cards_missing_ocr_text(self):
        """Test card generation with missing OCR text"""
        request_payload = {
            "occlusions": [{"x": 0, "y": 0, "width": 100, "height": 100, "text": "text"}]
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 422

    @patch("app.api.cards.card_generator.generate_cloze_cards")
    def test_generate_cards_default_card_type(self, mock_generate_cloze):
        """Test that default card type is cloze"""
        mock_card = GeneratedCard(
            content=CardContent(front="Front", back="Back"),
            confidence=0.85,
            model_used="google/flan-t5-base",
        )
        mock_generate_cloze.return_value = [mock_card]

        request_payload = {
            "ocr_text": "Some text.",
            "occlusions": [{"x": 0, "y": 0, "width": 100, "height": 100, "text": "text"}],
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200
        mock_generate_cloze.assert_called()

    @patch("app.api.cards.card_generator.generate_cloze_cards")
    def test_generate_cards_multiple_occlusions(self, mock_generate_cloze):
        """Test card generation with multiple occlusions"""
        mock_cards = [
            GeneratedCard(
                content=CardContent(front="Front1", back="Back1"),
                confidence=0.85,
                model_used="google/flan-t5-base",
            ),
            GeneratedCard(
                content=CardContent(front="Front2", back="Back2"),
                confidence=0.88,
                model_used="google/flan-t5-base",
            ),
        ]
        mock_generate_cloze.return_value = mock_cards

        request_payload = {
            "ocr_text": "Text with multiple words.",
            "occlusions": [
                {"x": 0, "y": 0, "width": 100, "height": 50, "text": "multiple"},
                {"x": 0, "y": 50, "width": 100, "height": 50, "text": "words"},
            ],
        }

        response = client.post("/api/cards/generate", json=request_payload)

        assert response.status_code == 200
        data = response.json()
        assert len(data["cards"]) == 2
