import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db/database'
import { Deck, Card } from '../../types'

describe('Database', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  afterEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  describe('Decks', () => {
    it('should create a deck', async () => {
      const deck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        description: 'A test deck',
        tags: ['test'],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.add(deck)
      const retrieved = await db.decks.get('deck-1')

      expect(retrieved).toEqual(deck)
    })

    it('should update a deck', async () => {
      const deck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        description: 'A test deck',
        tags: ['test'],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.add(deck)
      await db.decks.update('deck-1', { name: 'Updated Deck' })

      const updated = await db.decks.get('deck-1')
      expect(updated?.name).toBe('Updated Deck')
    })

    it('should delete a deck', async () => {
      const deck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        description: 'A test deck',
        tags: ['test'],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.add(deck)
      await db.decks.delete('deck-1')

      const retrieved = await db.decks.get('deck-1')
      expect(retrieved).toBeUndefined()
    })

    it('should query decks by tag', async () => {
      const deck1: Deck = {
        id: 'deck-1',
        name: 'Deck 1',
        tags: ['math', 'algebra'],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      const deck2: Deck = {
        id: 'deck-2',
        name: 'Deck 2',
        tags: ['science', 'biology'],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.bulkAdd([deck1, deck2])
      const mathDecks = await db.decks.where('tags').equals('math').toArray()

      expect(mathDecks).toHaveLength(1)
      expect(mathDecks[0].id).toBe('deck-1')
    })
  })

  describe('Cards', () => {
    it('should create a card', async () => {
      const card: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question',
        back: 'Answer',
        occlusions: [],
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.cards.add(card)
      const retrieved = await db.cards.get('card-1')

      expect(retrieved).toEqual(card)
    })

    it('should update a card', async () => {
      const card: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question',
        back: 'Answer',
        occlusions: [],
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.cards.add(card)
      await db.cards.update('card-1', { front: 'Updated Question' })

      const updated = await db.cards.get('card-1')
      expect(updated?.front).toBe('Updated Question')
    })

    it('should delete a card', async () => {
      const card: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question',
        back: 'Answer',
        occlusions: [],
        tags: ['test'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.cards.add(card)
      await db.cards.delete('card-1')

      const retrieved = await db.cards.get('card-1')
      expect(retrieved).toBeUndefined()
    })

    it('should query cards by deckId', async () => {
      const card1: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question 1',
        back: 'Answer 1',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      const card2: Card = {
        id: 'card-2',
        deckId: 'deck-1',
        front: 'Question 2',
        back: 'Answer 2',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      const card3: Card = {
        id: 'card-3',
        deckId: 'deck-2',
        front: 'Question 3',
        back: 'Answer 3',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.cards.bulkAdd([card1, card2, card3])
      const deck1Cards = await db.cards.where('deckId').equals('deck-1').toArray()

      expect(deck1Cards).toHaveLength(2)
      expect(deck1Cards.map((c) => c.id)).toEqual(['card-1', 'card-2'])
    })

    it('should handle cards with occlusions', async () => {
      const card: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Image with occlusions',
        back: 'Answer',
        imageUrl: 'https://example.com/image.jpg',
        occlusions: [
          {
            id: 'occ-1',
            x: 10,
            y: 20,
            width: 100,
            height: 50,
            label: 'Region 1',
          },
          {
            id: 'occ-2',
            x: 150,
            y: 200,
            width: 80,
            height: 60,
            label: 'Region 2',
          },
        ],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.cards.add(card)
      const retrieved = await db.cards.get('card-1')

      expect(retrieved?.occlusions).toHaveLength(2)
      expect(retrieved?.occlusions[0].label).toBe('Region 1')
    })
  })

  describe('Transactions', () => {
    it('should handle transactional operations', async () => {
      const deck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      const card: Card = {
        id: 'card-1',
        deckId: 'deck-1',
        front: 'Question',
        back: 'Answer',
        occlusions: [],
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.transaction('rw', db.decks, db.cards, async () => {
        await db.decks.add(deck)
        await db.cards.add(card)
        await db.decks.update('deck-1', { cardCount: 1 })
      })

      const retrievedDeck = await db.decks.get('deck-1')
      const retrievedCard = await db.cards.get('card-1')

      expect(retrievedDeck?.cardCount).toBe(1)
      expect(retrievedCard).toBeDefined()
    })
  })
})
