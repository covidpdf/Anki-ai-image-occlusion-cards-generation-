/**
 * API client for backend communication
 */
import type { CardGenerationRequest, CardGenerationResponse } from '../types/cards';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  /**
   * Generate cards from OCR text and occlusions
   */
  async generateCards(request: CardGenerationRequest): Promise<CardGenerationResponse> {
    const response = await fetch(`${API_URL}/api/cards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate cards');
    }

    return response.json();
  },

  /**
   * Check card generation service health
   */
  async checkCardsHealth() {
    const response = await fetch(`${API_URL}/api/cards/health`);

    if (!response.ok) {
      throw new Error('Cards service health check failed');
    }

    return response.json();
  },

  /**
   * Check overall API health
   */
  async checkHealth() {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
      throw new Error('API health check failed');
    }

    return response.json();
  },
};
