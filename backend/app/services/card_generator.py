"""Card generation service with prompt templates"""
import json
import logging
from typing import Optional

from app.schemas.cards import CardContent, GeneratedCard, OcclusionRegion
from app.services.model_manager import model_manager

logger = logging.getLogger(__name__)


class PromptTemplate:
    """Prompt template formatter for card generation"""

    @staticmethod
    def format_qa_prompt(
        context_text: str,
        occlusion_text: str,
        user_prompt: Optional[str] = None,
    ) -> str:
        """
        Format a prompt for Q&A card generation using Flan-T5

        Args:
            context_text: Full context text
            occlusion_text: Text to generate question about
            user_prompt: Optional user guidance

        Returns:
            Formatted prompt string
        """
        base_prompt = (
            f"Based on the following context:\n\n{context_text}\n\n"
            f"Generate a concise question and answer pair about the text: '{occlusion_text}'\n"
            f"Format the response as JSON with 'question' and 'answer' keys.\n"
        )

        if user_prompt:
            base_prompt += f"Additional instruction: {user_prompt}\n"

        base_prompt += (
            "Output only valid JSON. Example: " '{"question": "What is X?", "answer": "Y is Z"}'
        )

        return base_prompt

    @staticmethod
    def format_cloze_prompt(
        context_text: str,
        occlusion_text: str,
        user_prompt: Optional[str] = None,
    ) -> str:
        """
        Format a prompt for cloze deletion card generation

        Args:
            context_text: Full context text
            occlusion_text: Text to create cloze deletion for
            user_prompt: Optional user guidance

        Returns:
            Formatted prompt string
        """
        base_prompt = (
            f"From the following context:\n\n{context_text}\n\n"
            f"Create a cloze deletion card by replacing '{occlusion_text}' with '___'.\n"
            f"Then provide the answer.\n"
            f"Format the response as JSON with 'front' (cloze text) and 'back' (answer) keys.\n"
        )

        if user_prompt:
            base_prompt += f"Additional instruction: {user_prompt}\n"

        base_prompt += (
            "Output only valid JSON. Example: "
            '{"front": "The capital of France is ___", "back": "Paris"}'
        )

        return base_prompt

    @staticmethod
    def format_summarization_prompt(text: str) -> str:
        """
        Format a prompt for text summarization

        Args:
            text: Text to summarize

        Returns:
            Formatted prompt string
        """
        return f"Summarize the following text concisely in 1-2 sentences:\n\n{text}"


class CardGenerator:
    """Generate flashcards using HuggingFace models"""

    def __init__(self):
        """Initialize card generator"""
        self.model_manager = model_manager
        self.prompt_template = PromptTemplate()

    def generate_qa_cards(
        self,
        ocr_text: str,
        occlusions: list[OcclusionRegion],
        user_prompt: Optional[str] = None,
    ) -> list[GeneratedCard]:
        """
        Generate question/answer cards from OCR text and occlusions

        Args:
            ocr_text: Full OCR text
            occlusions: List of occlusion regions
            user_prompt: Optional user guidance

        Returns:
            List of generated cards with confidence scores
        """
        cards = []

        try:
            qa_generator = self.model_manager.get_model(
                "google/flan-t5-base", task="text2text-generation"
            )
        except Exception as e:
            logger.error(f"Failed to load Q&A model: {str(e)}")
            raise

        for occlusion in occlusions:
            if not occlusion.text:
                continue

            try:
                prompt = self.prompt_template.format_qa_prompt(
                    ocr_text, occlusion.text, user_prompt
                )

                result = qa_generator(
                    prompt,
                    max_length=256,
                    num_return_sequences=1,
                    do_sample=False,
                )

                response_text = result[0]["generated_text"]

                try:
                    card_data = json.loads(response_text)
                    question = card_data.get("question", "")
                    answer = card_data.get("answer", "")
                except json.JSONDecodeError:
                    question = f"Question about: {occlusion.text}"
                    answer = response_text

                card = GeneratedCard(
                    content=CardContent(front=question, back=answer),
                    confidence=0.85,
                    model_used="google/flan-t5-base",
                    reasoning=f"Generated Q&A for occlusion: {occlusion.text}",
                )
                cards.append(card)

            except Exception as e:
                logger.error(f"Error generating Q&A card for '{occlusion.text}': {str(e)}")

        return cards

    def generate_cloze_cards(
        self,
        ocr_text: str,
        occlusions: list[OcclusionRegion],
        user_prompt: Optional[str] = None,
    ) -> list[GeneratedCard]:
        """
        Generate cloze deletion cards from OCR text and occlusions

        Args:
            ocr_text: Full OCR text
            occlusions: List of occlusion regions
            user_prompt: Optional user guidance

        Returns:
            List of generated cards with confidence scores
        """
        cards = []

        try:
            cloze_generator = self.model_manager.get_model(
                "google/flan-t5-base", task="text2text-generation"
            )
        except Exception as e:
            logger.error(f"Failed to load cloze model: {str(e)}")
            raise

        for occlusion in occlusions:
            if not occlusion.text:
                continue

            try:
                prompt = self.prompt_template.format_cloze_prompt(
                    ocr_text, occlusion.text, user_prompt
                )

                result = cloze_generator(
                    prompt,
                    max_length=512,
                    num_return_sequences=1,
                    do_sample=False,
                )

                response_text = result[0]["generated_text"]

                try:
                    card_data = json.loads(response_text)
                    front = card_data.get("front", "")
                    back = card_data.get("back", "")
                except json.JSONDecodeError:
                    front = ocr_text.replace(occlusion.text, "___")
                    back = occlusion.text

                card = GeneratedCard(
                    content=CardContent(front=front, back=back),
                    confidence=0.88,
                    model_used="google/flan-t5-base",
                    reasoning=f"Generated cloze deletion for: {occlusion.text}",
                )
                cards.append(card)

            except Exception as e:
                logger.error(f"Error generating cloze card for '{occlusion.text}': {str(e)}")

        return cards

    def summarize_text(self, text: str) -> str:
        """
        Generate a summary of the given text

        Args:
            text: Text to summarize

        Returns:
            Summary string
        """
        try:
            summarizer = self.model_manager.get_model(
                "google/flan-t5-base", task="text2text-generation"
            )

            prompt = self.prompt_template.format_summarization_prompt(text)
            result = summarizer(prompt, max_length=128, do_sample=False)

            return result[0]["generated_text"]

        except Exception as e:
            logger.error(f"Error summarizing text: {str(e)}")
            return ""

    def calculate_average_confidence(self, cards: list[GeneratedCard]) -> float:
        """
        Calculate average confidence across multiple cards

        Args:
            cards: List of generated cards

        Returns:
            Average confidence score
        """
        if not cards:
            return 0.0

        total_confidence = sum(card.confidence for card in cards)
        return total_confidence / len(cards)
