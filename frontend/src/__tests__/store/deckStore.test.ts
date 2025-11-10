import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { useDeckStore } from '../../store/deckStore'
import { db } from '../../db/database'

describe('DeckStore', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
    useDeckStore.setState({
      decks: [],
      cards: [],
      selectedDeckId: null,
      searchQuery: '',
      tagFilter: [],
    })
  })

  afterEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  describe('Deck operations', () => {
    it('should create a deck', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
        description: 'A test deck',
        tags: ['test'],
      })

      expect(deck.name).toBe('Test Deck')
      expect(deck.description).toBe('A test deck')
      expect(deck.tags).toEqual(['test'])
      expect(deck.cardCount).toBe(0)
      expect(deck.syncStatus).toBe('pending')

      const dbDeck = await db.decks.get(deck.id)
      expect(dbDeck).toBeDefined()
    })

    it('should load decks from database', async () => {
      await db.decks.add({
        id: 'deck-1',
        name: 'Deck 1',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
        version: 1,
      })

      await db.decks.add({
        id: 'deck-2',
        name: 'Deck 2',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
        version: 1,
      })

      const store = useDeckStore.getState()
      await store.loadDecks()

      const currentState = useDeckStore.getState()
      expect(currentState.decks).toHaveLength(2)
    })

    it('should update a deck', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
        description: 'Original description',
      })

      await store.updateDeck(deck.id, {
        name: 'Updated Deck',
        description: 'Updated description',
      })

      await store.loadDecks()
      const updatedDeck = store.getDeckById(deck.id)

      expect(updatedDeck?.name).toBe('Updated Deck')
      expect(updatedDeck?.description).toBe('Updated description')
      expect(updatedDeck?.syncStatus).toBe('pending')
      expect(updatedDeck?.version).toBe(2)
    })

    it('should delete a deck', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      await store.deleteDeck(deck.id)
      await store.loadDecks()

      expect(store.getDeckById(deck.id)).toBeUndefined()

      const dbDeck = await db.decks.get(deck.id)
      expect(dbDeck).toBeUndefined()
    })

    it('should delete deck and associated cards', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      const card = await store.createCard({
        deckId: deck.id,
        front: 'Question',
        back: 'Answer',
      })

      await store.deleteDeck(deck.id)
      await store.loadDecks()
      await store.loadCards()

      expect(store.getDeckById(deck.id)).toBeUndefined()
      expect(store.cards.find((c) => c.id === card.id)).toBeUndefined()

      const dbCard = await db.cards.get(card.id)
      expect(dbCard).toBeUndefined()
    })
  })

  describe('Card operations', () => {
    it('should create a card', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      const card = await store.createCard({
        deckId: deck.id,
        front: 'Question',
        back: 'Answer',
        tags: ['test'],
        notes: 'Test notes',
        occlusions: [
          {
            id: 'occ-1',
            x: 10,
            y: 20,
            width: 100,
            height: 50,
          },
        ],
      })

      expect(card.front).toBe('Question')
      expect(card.back).toBe('Answer')
      expect(card.tags).toEqual(['test'])
      expect(card.notes).toBe('Test notes')
      expect(card.occlusions).toHaveLength(1)
      expect(card.syncStatus).toBe('pending')

      const dbCard = await db.cards.get(card.id)
      expect(dbCard).toBeDefined()

      await store.loadDecks()
      const updatedDeck = store.getDeckById(deck.id)
      expect(updatedDeck?.cardCount).toBe(1)
    })

    it('should load cards from database', async () => {
      await db.cards.add({
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question 1',
        back: 'Answer 1',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
        version: 1,
      })

      await db.cards.add({
        id: 'card-2',
        deckId: 'deck-1',
        front: 'Question 2',
        back: 'Answer 2',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
        version: 1,
      })

      const store = useDeckStore.getState()
      await store.loadCards('deck-1')

      const currentState = useDeckStore.getState()
      expect(currentState.cards).toHaveLength(2)
    })

    it('should update a card', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      const card = await store.createCard({
        deckId: deck.id,
        front: 'Original Question',
        back: 'Original Answer',
      })

      await store.updateCard(card.id, {
        front: 'Updated Question',
        back: 'Updated Answer',
      })

      const currentState = useDeckStore.getState()
      const updatedCard = currentState.cards.find((c) => c.id === card.id)

      expect(updatedCard?.front).toBe('Updated Question')
      expect(updatedCard?.back).toBe('Updated Answer')
      expect(updatedCard?.syncStatus).toBe('pending')
      expect(updatedCard?.version).toBe(2)
    })

    it('should delete a card', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      const card = await store.createCard({
        deckId: deck.id,
        front: 'Question',
        back: 'Answer',
      })

      await store.deleteCard(card.id)
      await store.loadCards()

      expect(store.cards.find((c) => c.id === card.id)).toBeUndefined()

      const dbCard = await db.cards.get(card.id)
      expect(dbCard).toBeUndefined()

      await store.loadDecks()
      const updatedDeck = store.getDeckById(deck.id)
      expect(updatedDeck?.cardCount).toBe(0)
    })
  })

  describe('Search and filter', () => {
    beforeEach(async () => {
      const store = useDeckStore.getState()

      await store.createDeck({
        name: 'Math Deck',
        description: 'Mathematics questions',
        tags: ['math', 'algebra'],
      })

      await store.createDeck({
        name: 'Science Deck',
        description: 'Science questions',
        tags: ['science', 'biology'],
      })

      await store.createDeck({
        name: 'History Deck',
        description: 'History questions',
        tags: ['history'],
      })

      await store.loadDecks()
    })

    it('should filter decks by search query', () => {
      const store = useDeckStore.getState()
      store.setSearchQuery('math')

      const filtered = store.getFilteredDecks()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Math Deck')
    })

    it('should filter decks by description', () => {
      const store = useDeckStore.getState()
      store.setSearchQuery('science')

      const filtered = store.getFilteredDecks()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Science Deck')
    })

    it('should filter decks by tags', async () => {
      const store = useDeckStore.getState()
      await store.loadDecks()
      store.setTagFilter(['math'])

      const currentState = useDeckStore.getState()
      const filtered = currentState.getFilteredDecks()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Math Deck')
    })

    it('should filter decks by multiple tags', async () => {
      const store = useDeckStore.getState()
      await store.loadDecks()
      store.setTagFilter(['math', 'algebra'])

      const currentState = useDeckStore.getState()
      const filtered = currentState.getFilteredDecks()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Math Deck')
    })

    it('should combine search and tag filters', () => {
      const store = useDeckStore.getState()
      store.setSearchQuery('deck')
      store.setTagFilter(['science'])

      const filtered = store.getFilteredDecks()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Science Deck')
    })

    it('should clear search query', async () => {
      const store = useDeckStore.getState()
      store.setSearchQuery('math')
      store.setSearchQuery('')

      await store.loadDecks()
      const currentState = useDeckStore.getState()
      const filtered = currentState.getFilteredDecks()
      expect(filtered).toHaveLength(3)
    })

    it('should clear tag filters', () => {
      const store = useDeckStore.getState()
      store.setTagFilter(['math'])
      store.setTagFilter([])

      const filtered = store.getFilteredDecks()
      expect(filtered).toHaveLength(3)
    })
  })

  describe('Selection', () => {
    it('should select a deck', () => {
      const store = useDeckStore.getState()
      store.selectDeck('deck-1')

      const currentState = useDeckStore.getState()
      expect(currentState.selectedDeckId).toBe('deck-1')
    })

    it('should clear selection', () => {
      const store = useDeckStore.getState()
      store.selectDeck('deck-1')
      store.selectDeck(null)

      expect(store.selectedDeckId).toBeNull()
    })
  })

  describe('Utility methods', () => {
    it('should get deck by id', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      const found = store.getDeckById(deck.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('Test Deck')
    })

    it('should get cards by deck id', async () => {
      const store = useDeckStore.getState()
      const deck = await store.createDeck({
        name: 'Test Deck',
      })

      await store.createCard({
        deckId: deck.id,
        front: 'Question 1',
        back: 'Answer 1',
      })

      await store.createCard({
        deckId: deck.id,
        front: 'Question 2',
        back: 'Answer 2',
      })

      const cards = store.getCardsByDeckId(deck.id)
      expect(cards).toHaveLength(2)
    })
  })
})
