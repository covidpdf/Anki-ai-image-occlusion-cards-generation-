import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { syncService } from '../../services/syncService'
import { deckApiService } from '../../services/deckApiService'
import { db } from '../../db/database'
import { Deck, Card } from '../../types'

vi.mock('../../services/deckApiService')

describe('SyncService', () => {
  beforeEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await db.decks.clear()
    await db.cards.clear()
  })

  describe('syncDecks', () => {
    it('should create new deck on server', async () => {
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.add(localDeck)

      vi.mocked(deckApiService.createDeck).mockResolvedValue(localDeck)
      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([])

      const result = await syncService.syncAll()

      expect(result.success).toBe(true)
      expect(result.synced).toBeGreaterThan(0)
      expect(deckApiService.createDeck).toHaveBeenCalledWith(localDeck)

      const syncedDeck = await db.decks.get('deck-1')
      expect(syncedDeck?.syncStatus).toBe('synced')
    })

    it('should update existing deck on server', async () => {
      const now = Date.now()
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Updated Deck',
        tags: [],
        cardCount: 0,
        createdAt: now - 1000,
        updatedAt: now,
        lastSyncedAt: now - 500,
        syncStatus: 'pending',
        version: 2,
      }

      await db.decks.add(localDeck)

      const remoteDeck: Deck = {
        ...localDeck,
        version: 1,
      }

      vi.mocked(deckApiService.getDeck).mockResolvedValue(remoteDeck)
      vi.mocked(deckApiService.updateDeck).mockResolvedValue(localDeck)
      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([])

      const result = await syncService.syncAll()

      expect(result.success).toBe(true)
      expect(deckApiService.updateDeck).toHaveBeenCalledWith('deck-1', localDeck)
    })

    it('should detect conflict when remote version is newer', async () => {
      const now = Date.now()
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Local Version',
        tags: [],
        cardCount: 0,
        createdAt: now - 1000,
        updatedAt: now,
        lastSyncedAt: now - 500,
        syncStatus: 'pending',
        version: 2,
      }

      await db.decks.add(localDeck)

      const remoteDeck: Deck = {
        ...localDeck,
        name: 'Remote Version',
        version: 3,
      }

      vi.mocked(deckApiService.getDeck).mockResolvedValue(remoteDeck)
      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([])

      const result = await syncService.syncAll()

      expect(result.conflicts).toHaveLength(1)
      expect(result.success).toBe(true)
    })

    it('should pull new decks from server', async () => {
      const remoteDeck: Deck = {
        id: 'deck-1',
        name: 'Remote Deck',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced',
        version: 1,
      }

      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([remoteDeck])

      const result = await syncService.syncAll()

      expect(result.success).toBe(true)
      expect(result.synced).toBeGreaterThan(0)

      const localDeck = await db.decks.get('deck-1')
      expect(localDeck).toBeDefined()
      expect(localDeck?.name).toBe('Remote Deck')
    })
  })

  describe('syncCards', () => {
    it('should create new card on server', async () => {
      const localCard: Card = {
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

      await db.cards.add(localCard)

      vi.mocked(deckApiService.createCard).mockResolvedValue(localCard)
      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([])

      const result = await syncService.syncAll()

      expect(result.success).toBe(true)
      expect(deckApiService.createCard).toHaveBeenCalledWith(localCard)

      const syncedCard = await db.cards.get('card-1')
      expect(syncedCard?.syncStatus).toBe('synced')
    })

    it('should handle sync errors gracefully', async () => {
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Test Deck',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 1,
      }

      await db.decks.add(localDeck)

      vi.mocked(deckApiService.createDeck).mockRejectedValue(
        new Error('Network error')
      )
      vi.mocked(deckApiService.getAllDecks).mockResolvedValue([])

      const result = await syncService.syncAll()

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].error).toContain('Network error')
    })
  })

  describe('resolveConflict', () => {
    it('should resolve conflict by choosing local version', async () => {
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Local Version',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 2,
      }

      const remoteDeck: Deck = {
        ...localDeck,
        name: 'Remote Version',
        version: 3,
      }

      await db.decks.add(localDeck)

      vi.mocked(deckApiService.updateDeck).mockResolvedValue(localDeck)

      await syncService.resolveConflict(
        {
          id: 'conflict-1',
          entityType: 'deck',
          entityId: 'deck-1',
          localVersion: localDeck,
          remoteVersion: remoteDeck,
          timestamp: Date.now(),
          resolved: false,
        },
        'local'
      )

      const resolvedDeck = await db.decks.get('deck-1')
      expect(resolvedDeck?.name).toBe('Local Version')
      expect(resolvedDeck?.syncStatus).toBe('synced')
      expect(deckApiService.updateDeck).toHaveBeenCalled()
    })

    it('should resolve conflict by choosing remote version', async () => {
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Local Version',
        tags: [],
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 2,
      }

      const remoteDeck: Deck = {
        ...localDeck,
        name: 'Remote Version',
        version: 3,
      }

      await db.decks.add(localDeck)

      await syncService.resolveConflict(
        {
          id: 'conflict-1',
          entityType: 'deck',
          entityId: 'deck-1',
          localVersion: localDeck,
          remoteVersion: remoteDeck,
          timestamp: Date.now(),
          resolved: false,
        },
        'remote'
      )

      const resolvedDeck = await db.decks.get('deck-1')
      expect(resolvedDeck?.name).toBe('Remote Version')
      expect(resolvedDeck?.syncStatus).toBe('synced')
    })

    it('should resolve conflict by merging versions', async () => {
      const localDeck: Deck = {
        id: 'deck-1',
        name: 'Local Version',
        tags: ['local-tag'],
        cardCount: 5,
        createdAt: Date.now() - 1000,
        updatedAt: Date.now(),
        syncStatus: 'pending',
        version: 2,
      }

      const remoteDeck: Deck = {
        ...localDeck,
        name: 'Remote Version',
        tags: ['remote-tag'],
        version: 3,
      }

      await db.decks.add(localDeck)

      vi.mocked(deckApiService.updateDeck).mockResolvedValue(localDeck)

      await syncService.resolveConflict(
        {
          id: 'conflict-1',
          entityType: 'deck',
          entityId: 'deck-1',
          localVersion: localDeck,
          remoteVersion: remoteDeck,
          timestamp: Date.now(),
          resolved: false,
        },
        'merge'
      )

      const resolvedDeck = await db.decks.get('deck-1')
      expect(resolvedDeck?.version).toBeGreaterThan(3)
      expect(resolvedDeck?.syncStatus).toBe('synced')
    })
  })
})
