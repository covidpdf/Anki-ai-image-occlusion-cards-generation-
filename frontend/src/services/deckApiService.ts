import { Deck, Card } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class DeckApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${error}`)
    }

    return response.json()
  }

  async getAllDecks(): Promise<Deck[]> {
    return this.request<Deck[]>('/api/decks')
  }

  async getDeck(id: string): Promise<Deck> {
    return this.request<Deck>(`/api/decks/${id}`)
  }

  async createDeck(deck: Deck): Promise<Deck> {
    return this.request<Deck>('/api/decks', {
      method: 'POST',
      body: JSON.stringify(deck),
    })
  }

  async updateDeck(id: string, deck: Partial<Deck>): Promise<Deck> {
    return this.request<Deck>(`/api/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deck),
    })
  }

  async deleteDeck(id: string): Promise<void> {
    await this.request<void>(`/api/decks/${id}`, {
      method: 'DELETE',
    })
  }

  async getCard(id: string): Promise<Card> {
    return this.request<Card>(`/api/cards/${id}`)
  }

  async getCardsByDeck(deckId: string): Promise<Card[]> {
    return this.request<Card[]>(`/api/decks/${deckId}/cards`)
  }

  async createCard(card: Card): Promise<Card> {
    return this.request<Card>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    })
  }

  async updateCard(id: string, card: Partial<Card>): Promise<Card> {
    return this.request<Card>(`/api/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(card),
    })
  }

  async deleteCard(id: string): Promise<void> {
    await this.request<void>(`/api/cards/${id}`, {
      method: 'DELETE',
    })
  }
}

export const deckApiService = new DeckApiService()
