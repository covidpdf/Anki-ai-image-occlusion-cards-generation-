"""Unit tests for prompt template formatting"""

from app.services.card_generator import PromptTemplate


class TestPromptTemplate:
    """Test cases for prompt template formatting"""

    def test_format_qa_prompt_basic(self):
        """Test basic Q&A prompt formatting"""
        template = PromptTemplate()
        context = "The Eiffel Tower is a famous landmark in Paris."
        occlusion = "Paris"

        prompt = template.format_qa_prompt(context, occlusion)

        assert "question" in prompt.lower()
        assert "answer" in prompt.lower()
        assert context in prompt
        assert occlusion in prompt
        assert "JSON" in prompt

    def test_format_qa_prompt_with_user_guidance(self):
        """Test Q&A prompt with user guidance"""
        template = PromptTemplate()
        context = "Water freezes at 0 degrees Celsius."
        occlusion = "0 degrees Celsius"
        user_prompt = "Create a science-focused question"

        prompt = template.format_qa_prompt(context, occlusion, user_prompt)

        assert context in prompt
        assert occlusion in prompt
        assert user_prompt in prompt
        assert "Additional instruction" in prompt

    def test_format_cloze_prompt_basic(self):
        """Test basic cloze prompt formatting"""
        template = PromptTemplate()
        context = "The capital of France is Paris."
        occlusion = "Paris"

        prompt = template.format_cloze_prompt(context, occlusion)

        assert "cloze" in prompt.lower()
        assert "___" in prompt
        assert context in prompt
        assert occlusion in prompt
        assert "JSON" in prompt

    def test_format_cloze_prompt_with_user_guidance(self):
        """Test cloze prompt with user guidance"""
        template = PromptTemplate()
        context = "Photosynthesis is a process used by plants."
        occlusion = "Photosynthesis"
        user_prompt = "Focus on biology terminology"

        prompt = template.format_cloze_prompt(context, occlusion, user_prompt)

        assert context in prompt
        assert occlusion in prompt
        assert user_prompt in prompt
        assert "front" in prompt.lower()
        assert "back" in prompt.lower()

    def test_format_summarization_prompt(self):
        """Test summarization prompt formatting"""
        template = PromptTemplate()
        text = "This is a long text that needs to be summarized."

        prompt = template.format_summarization_prompt(text)

        assert "summarize" in prompt.lower()
        assert text in prompt
        assert "concisely" in prompt.lower()

    def test_qa_prompt_includes_json_example(self):
        """Test that Q&A prompt includes JSON format example"""
        template = PromptTemplate()

        prompt = template.format_qa_prompt("context", "occlusion")

        assert '{"question"' in prompt
        assert '"answer"' in prompt

    def test_cloze_prompt_includes_json_example(self):
        """Test that cloze prompt includes JSON format example"""
        template = PromptTemplate()

        prompt = template.format_cloze_prompt("context", "occlusion")

        assert '{"front"' in prompt
        assert '"back"' in prompt
        assert '"___"' in prompt or "'___'" in prompt
