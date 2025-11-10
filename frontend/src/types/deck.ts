export interface Deck {
  id: string
  name: string
  description?: string
  tags: string[]
  cardCount: number
  createdAt: number
  updatedAt: number
  lastSyncedAt?: number
  syncStatus: 'synced' | 'pending' | 'conflict'
  version: number
}

export interface DeckCreate {
  name: string
  description?: string
  tags?: string[]
}

export interface DeckUpdate {
  name?: string
  description?: string
  tags?: string[]
}

export interface DeckWithCards extends Deck {
  cards: import('./card').Card[]
}
