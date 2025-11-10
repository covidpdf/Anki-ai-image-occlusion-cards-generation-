"""Unit tests for card generation service"""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.schemas.cards import CardContent, GeneratedCard, OcclusionRegion
from app.services.card_generator import CardGenerator


class TestCardGenerator:
    """Test cases for card generator service"""

    @pytest.fixture
    def card_generator(self):
        """Create a card generator instance for testing"""
        return CardGenerator()

    @pytest.fixture
    def sample_occlusions(self):
        """Create sample occlusion regions"""
        return [
            OcclusionRegion(x=10, y=10, width=100, height=50, text="Paris"),
            OcclusionRegion(x=120, y=10, width=100, height=50, text="France"),
        ]

    def test_calculate_average_confidence_single_card(self, card_generator):
        """Test average confidence calculation with single card"""
        card = GeneratedCard(
            content=CardContent(front="Q?", back="A"),
            confidence=0.85,
            model_used="test-model",
        )

        avg = card_generator.calculate_average_confidence([card])

        assert avg == 0.85

    def test_calculate_average_confidence_multiple_cards(self, card_generator):
        """Test average confidence calculation with multiple cards"""
        cards = [
            GeneratedCard(
                content=CardContent(front="Q1?", back="A1"),
                confidence=0.8,
                model_used="test-model",
            ),
            GeneratedCard(
                content=CardContent(front="Q2?", back="A2"),
                confidence=0.9,
                model_used="test-model",
            ),
        ]

        avg = card_generator.calculate_average_confidence(cards)

        assert abs(avg - 0.85) < 0.0001

    def test_calculate_average_confidence_empty_list(self, card_generator):
        """Test average confidence calculation with empty list"""
        avg = card_generator.calculate_average_confidence([])

        assert avg == 0.0

    @patch("app.services.card_generator.model_manager")
    def test_generate_qa_cards_with_mock(self, mock_manager, card_generator, sample_occlusions):
        """Test Q&A card generation with mocked model"""
        mock_generator = MagicMock()
        mock_generator.return_value = [
            {
                "generated_text": json.dumps(
                    {"question": "What is the capital of France?", "answer": "Paris"}
                )
            }
        ]
        mock_manager.get_model.return_value = mock_generator

        card_generator.model_manager = mock_manager

        ocr_text = "The capital of France is Paris."
        cards = card_generator.generate_qa_cards(ocr_text, [sample_occlusions[0]])

        assert len(cards) > 0
        assert cards[0].content.front
        assert cards[0].content.back
        assert 0.0 <= cards[0].confidence <= 1.0

    @patch("app.services.card_generator.model_manager")
    def test_generate_qa_cards_invalid_json_response(
        self, mock_manager, card_generator, sample_occlusions
    ):
        """Test Q&A card generation with invalid JSON response"""
        mock_generator = MagicMock()
        mock_generator.return_value = [{"generated_text": "Invalid JSON response"}]
        mock_manager.get_model.return_value = mock_generator

        card_generator.model_manager = mock_manager

        ocr_text = "The capital of France is Paris."
        cards = card_generator.generate_qa_cards(ocr_text, [sample_occlusions[0]])

        assert len(cards) > 0
        assert cards[0].content.front
        assert cards[0].content.back

    @patch("app.services.card_generator.model_manager")
    def test_generate_cloze_cards_with_mock(self, mock_manager, card_generator, sample_occlusions):
        """Test cloze card generation with mocked model"""
        mock_generator = MagicMock()
        mock_generator.return_value = [
            {
                "generated_text": json.dumps(
                    {"front": "The capital of France is ___", "back": "Paris"}
                )
            }
        ]
        mock_manager.get_model.return_value = mock_generator

        card_generator.model_manager = mock_manager

        ocr_text = "The capital of France is Paris."
        cards = card_generator.generate_cloze_cards(ocr_text, [sample_occlusions[0]])

        assert len(cards) > 0
        assert "___" in cards[0].content.front or "___" in cards[0].content.back
        assert 0.0 <= cards[0].confidence <= 1.0

    @patch("app.services.card_generator.model_manager")
    def test_generate_cloze_cards_invalid_json_response(
        self, mock_manager, card_generator, sample_occlusions
    ):
        """Test cloze card generation with invalid JSON response"""
        mock_generator = MagicMock()
        mock_generator.return_value = [{"generated_text": "Not valid JSON"}]
        mock_manager.get_model.return_value = mock_generator

        card_generator.model_manager = mock_manager

        ocr_text = "The capital of France is Paris."
        cards = card_generator.generate_cloze_cards(ocr_text, [sample_occlusions[0]])

        assert len(cards) > 0
        assert cards[0].content.front
        assert cards[0].content.back

    @patch("app.services.card_generator.model_manager")
    def test_generate_cards_empty_occlusions(self, mock_manager, card_generator):
        """Test card generation with empty occlusions"""
        card_generator.model_manager = mock_manager

        ocr_text = "Some text"
        cards = card_generator.generate_qa_cards(ocr_text, [])

        assert len(cards) == 0

    @patch("app.services.card_generator.model_manager")
    def test_generate_cards_with_user_prompt(self, mock_manager, card_generator, sample_occlusions):
        """Test card generation with user prompt"""
        mock_generator = MagicMock()
        mock_generator.return_value = [
            {
                "generated_text": json.dumps(
                    {"question": "What country is Paris in?", "answer": "France"}
                )
            }
        ]
        mock_manager.get_model.return_value = mock_generator

        card_generator.model_manager = mock_manager

        ocr_text = "Paris is in France."
        user_prompt = "Ask about countries"
        cards = card_generator.generate_qa_cards(ocr_text, [sample_occlusions[0]], user_prompt)

        assert len(cards) > 0

    @patch("app.services.card_generator.model_manager")
    def test_summarize_text(self, mock_manager, card_generator):
        """Test text summarization"""
        mock_summarizer = MagicMock()
        mock_summarizer.return_value = [{"generated_text": "Paris is a city in France."}]
        mock_manager.get_model.return_value = mock_summarizer

        card_generator.model_manager = mock_manager

        long_text = "Paris, the capital of France, is known for its museums and landmarks."
        summary = card_generator.summarize_text(long_text)

        assert summary
        assert isinstance(summary, str)

    @patch("app.services.card_generator.model_manager")
    def test_summarize_text_error_handling(self, mock_manager, card_generator):
        """Test summarization error handling"""
        mock_manager.get_model.side_effect = Exception("Model load failed")

        card_generator.model_manager = mock_manager

        summary = card_generator.summarize_text("Some text")

        assert summary == ""
