import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { Deck, DeckCreate, DeckUpdate, Card, CardCreate, CardUpdate } from '../types'

interface DeckState {
  decks: Deck[]
  cards: Card[]
  selectedDeckId: string | null
  searchQuery: string
  tagFilter: string[]

  // Deck actions
  loadDecks: () => Promise<void>
  createDeck: (deck: DeckCreate) => Promise<Deck>
  updateDeck: (id: string, updates: DeckUpdate) => Promise<void>
  deleteDeck: (id: string) => Promise<void>
  selectDeck: (id: string | null) => void

  // Card actions
  loadCards: (deckId?: string) => Promise<void>
  createCard: (card: CardCreate) => Promise<Card>
  updateCard: (id: string, updates: CardUpdate) => Promise<void>
  deleteCard: (id: string) => Promise<void>

  // Search and filter
  setSearchQuery: (query: string) => void
  setTagFilter: (tags: string[]) => void
  getFilteredDecks: () => Deck[]

  // Utility
  getDeckById: (id: string) => Deck | undefined
  getCardsByDeckId: (deckId: string) => Card[]
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  cards: [],
  selectedDeckId: null,
  searchQuery: '',
  tagFilter: [],

  loadDecks: async () => {
    const decks = await db.decks.toArray()
    set({ decks })
  },

  createDeck: async (deckData: DeckCreate) => {
    const now = Date.now()
    const deck: Deck = {
      id: uuidv4(),
      name: deckData.name,
      description: deckData.description,
      tags: deckData.tags || [],
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      version: 1,
    }

    await db.decks.add(deck)
    set((state) => ({ decks: [...state.decks, deck] }))
    return deck
  },

  updateDeck: async (id: string, updates: DeckUpdate) => {
    const now = Date.now()
    const deck = await db.decks.get(id)
    
    if (!deck) {
      throw new Error(`Deck with id ${id} not found`)
    }

    const updatedDeck: Deck = {
      ...deck,
      ...updates,
      updatedAt: now,
      syncStatus: 'pending',
      version: deck.version + 1,
    }

    await db.decks.update(id, {
      ...updates,
      updatedAt: now,
      syncStatus: 'pending' as const,
      version: deck.version + 1,
    })
    set((state) => ({
      decks: state.decks.map((d) => (d.id === id ? updatedDeck : d)),
    }))
  },

  deleteDeck: async (id: string) => {
    await db.transaction('rw', db.decks, db.cards, async () => {
      await db.cards.where('deckId').equals(id).delete()
      await db.decks.delete(id)
    })

    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
      cards: state.cards.filter((c) => c.deckId !== id),
      selectedDeckId: state.selectedDeckId === id ? null : state.selectedDeckId,
    }))
  },

  selectDeck: (id: string | null) => {
    set({ selectedDeckId: id })
  },

  loadCards: async (deckId?: string) => {
    const cards = deckId
      ? await db.cards.where('deckId').equals(deckId).toArray()
      : await db.cards.toArray()
    set({ cards })
  },

  createCard: async (cardData: CardCreate) => {
    const now = Date.now()
    const card: Card = {
      id: uuidv4(),
      deckId: cardData.deckId,
      front: cardData.front,
      back: cardData.back,
      imageUrl: cardData.imageUrl,
      occlusions: cardData.occlusions || [],
      notes: cardData.notes,
      tags: cardData.tags || [],
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      version: 1,
    }

    await db.transaction('rw', db.cards, db.decks, async () => {
      await db.cards.add(card)
      
      const deck = await db.decks.get(cardData.deckId)
      if (deck) {
        await db.decks.update(cardData.deckId, {
          cardCount: deck.cardCount + 1,
          updatedAt: now,
          syncStatus: 'pending' as const,
          version: deck.version + 1,
        })
      }
    })

    set((state) => ({
      cards: [...state.cards, card],
      decks: state.decks.map((d) =>
        d.id === cardData.deckId
          ? { ...d, cardCount: d.cardCount + 1, updatedAt: now, syncStatus: 'pending' as const, version: d.version + 1 }
          : d
      ),
    }))

    return card
  },

  updateCard: async (id: string, updates: CardUpdate) => {
    const now = Date.now()
    const card = await db.cards.get(id)
    
    if (!card) {
      throw new Error(`Card with id ${id} not found`)
    }

    const updatedCard: Card = {
      ...card,
      ...updates,
      updatedAt: now,
      syncStatus: 'pending',
      version: card.version + 1,
    }

    await db.cards.update(id, {
      ...updates,
      updatedAt: now,
      syncStatus: 'pending' as const,
      version: card.version + 1,
    })
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? updatedCard : c)),
    }))
  },

  deleteCard: async (id: string) => {
    const card = await db.cards.get(id)
    if (!card) return

    await db.transaction('rw', db.cards, db.decks, async () => {
      await db.cards.delete(id)
      
      const deck = await db.decks.get(card.deckId)
      if (deck) {
        await db.decks.update(card.deckId, {
          cardCount: Math.max(0, deck.cardCount - 1),
          updatedAt: Date.now(),
          syncStatus: 'pending' as const,
          version: deck.version + 1,
        })
      }
    })

    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      decks: state.decks.map((d) =>
        d.id === card.deckId
          ? { ...d, cardCount: Math.max(0, d.cardCount - 1), updatedAt: Date.now(), syncStatus: 'pending' as const, version: d.version + 1 }
          : d
      ),
    }))
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  setTagFilter: (tags: string[]) => {
    set({ tagFilter: tags })
  },

  getFilteredDecks: () => {
    const { decks, searchQuery, tagFilter } = get()
    
    return decks.filter((deck) => {
      const matchesSearch = searchQuery
        ? deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesTags =
        tagFilter.length > 0
          ? tagFilter.every((tag) => deck.tags.includes(tag))
          : true

      return matchesSearch && matchesTags
    })
  },

  getDeckById: (id: string) => {
    return get().decks.find((d) => d.id === id)
  },

  getCardsByDeckId: (deckId: string) => {
    return get().cards.filter((c) => c.deckId === deckId)
  },
}))
