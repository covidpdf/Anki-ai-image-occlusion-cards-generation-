"""Model management service for HuggingFace transformers with caching"""
import logging

from transformers import pipeline

logger = logging.getLogger(__name__)


class ModelManager:
    """Manages HuggingFace transformer models with caching"""

    _instance = None
    _models = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize model manager (singleton pattern)"""
        if not hasattr(self, "_initialized"):
            self._initialized = True
            logger.info("Initializing ModelManager")

    def get_model(self, model_name: str, task: str = "text2text-generation"):
        """
        Get or load a model from cache

        Args:
            model_name: Name of the model (e.g., 'google/flan-t5-base')
            task: Task type for the pipeline

        Returns:
            The loaded model pipeline
        """
        cache_key = f"{model_name}_{task}"

        if cache_key not in self._models:
            logger.info(f"Loading model: {model_name} for task: {task}")
            try:
                self._models[cache_key] = pipeline(task, model=model_name)
                logger.info(f"Successfully loaded model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {str(e)}")
                raise

        return self._models[cache_key]

    def clear_cache(self):
        """Clear all cached models"""
        self._models.clear()
        logger.info("Cleared model cache")

    def get_cached_models(self) -> list[str]:
        """Get list of currently cached models"""
        return list(self._models.keys())


# Global singleton instance
model_manager = ModelManager()
