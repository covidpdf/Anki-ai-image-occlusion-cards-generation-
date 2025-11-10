import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { Deck, Card, SyncConflict, SyncResult, SyncError, ConflictResolution } from '../types'
import { deckApiService } from './deckApiService'

class SyncService {
  async syncAll(): Promise<SyncResult> {
    const errors: SyncError[] = []
    const conflicts: SyncConflict[] = []
    let synced = 0

    try {
      const deckResult = await this.syncDecks()
      synced += deckResult.synced
      errors.push(...deckResult.errors)
      conflicts.push(...deckResult.conflicts)

      const cardResult = await this.syncCards()
      synced += cardResult.synced
      errors.push(...cardResult.errors)
      conflicts.push(...cardResult.conflicts)

      return {
        success: errors.length === 0,
        synced,
        conflicts,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        synced,
        conflicts,
        errors: [
          {
            id: uuidv4(),
            entityType: 'deck',
            entityId: '',
            error: error instanceof Error ? error.message : 'Unknown sync error',
            timestamp: Date.now(),
          },
        ],
      }
    }
  }

  private async syncDecks(): Promise<{ synced: number; errors: SyncError[]; conflicts: SyncConflict[] }> {
    const errors: SyncError[] = []
    const conflicts: SyncConflict[] = []
    let synced = 0

    const localDecks = await db.decks.where('syncStatus').notEqual('synced').toArray()

    for (const localDeck of localDecks) {
      try {
        if (!localDeck.lastSyncedAt) {
          await deckApiService.createDeck(localDeck)
          await db.decks.update(localDeck.id, {
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          })
          synced++
        } else {
          const remoteDeck = await deckApiService.getDeck(localDeck.id)
          
          if (remoteDeck.version > localDeck.version) {
            conflicts.push({
              id: uuidv4(),
              entityType: 'deck',
              entityId: localDeck.id,
              localVersion: localDeck,
              remoteVersion: remoteDeck,
              timestamp: Date.now(),
              resolved: false,
            })
          } else {
            await deckApiService.updateDeck(localDeck.id, localDeck)
            await db.decks.update(localDeck.id, {
              syncStatus: 'synced',
              lastSyncedAt: Date.now(),
            })
            synced++
          }
        }
      } catch (error) {
        errors.push({
          id: uuidv4(),
          entityType: 'deck',
          entityId: localDeck.id,
          error: error instanceof Error ? error.message : 'Failed to sync deck',
          timestamp: Date.now(),
        })
      }
    }

    try {
      const remoteDecks = await deckApiService.getAllDecks()
      
      for (const remoteDeck of remoteDecks) {
        const localDeck = await db.decks.get(remoteDeck.id)
        
        if (!localDeck) {
          await db.decks.add({
            ...remoteDeck,
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          })
          synced++
        }
      }
    } catch (error) {
      errors.push({
        id: uuidv4(),
        entityType: 'deck',
        entityId: '',
        error: error instanceof Error ? error.message : 'Failed to fetch remote decks',
        timestamp: Date.now(),
      })
    }

    return { synced, errors, conflicts }
  }

  private async syncCards(): Promise<{ synced: number; errors: SyncError[]; conflicts: SyncConflict[] }> {
    const errors: SyncError[] = []
    const conflicts: SyncConflict[] = []
    let synced = 0

    const localCards = await db.cards.where('syncStatus').notEqual('synced').toArray()

    for (const localCard of localCards) {
      try {
        if (!localCard.lastSyncedAt) {
          await deckApiService.createCard(localCard)
          await db.cards.update(localCard.id, {
            syncStatus: 'synced',
            lastSyncedAt: Date.now(),
          })
          synced++
        } else {
          const remoteCard = await deckApiService.getCard(localCard.id)
          
          if (remoteCard.version > localCard.version) {
            conflicts.push({
              id: uuidv4(),
              entityType: 'card',
              entityId: localCard.id,
              localVersion: localCard,
              remoteVersion: remoteCard,
              timestamp: Date.now(),
              resolved: false,
            })
          } else {
            await deckApiService.updateCard(localCard.id, localCard)
            await db.cards.update(localCard.id, {
              syncStatus: 'synced',
              lastSyncedAt: Date.now(),
            })
            synced++
          }
        }
      } catch (error) {
        errors.push({
          id: uuidv4(),
          entityType: 'card',
          entityId: localCard.id,
          error: error instanceof Error ? error.message : 'Failed to sync card',
          timestamp: Date.now(),
        })
      }
    }

    return { synced, errors, conflicts }
  }

  async resolveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<void> {
    const { entityType, entityId, localVersion, remoteVersion } = conflict

    let resolvedVersion: any

    switch (resolution) {
      case 'local':
        resolvedVersion = localVersion
        break
      case 'remote':
        resolvedVersion = remoteVersion
        break
      case 'merge':
        resolvedVersion = this.mergeVersions(localVersion, remoteVersion)
        break
    }

    if (entityType === 'deck') {
      await db.decks.update(entityId, {
        ...resolvedVersion,
        syncStatus: 'synced',
        lastSyncedAt: Date.now(),
      })
      
      if (resolution !== 'remote') {
        await deckApiService.updateDeck(entityId, resolvedVersion)
      }
    } else {
      await db.cards.update(entityId, {
        ...resolvedVersion,
        syncStatus: 'synced',
        lastSyncedAt: Date.now(),
      })
      
      if (resolution !== 'remote') {
        await deckApiService.updateCard(entityId, resolvedVersion)
      }
    }
  }

  private mergeVersions(local: Deck | Card, remote: Deck | Card): unknown {
    return {
      ...remote,
      ...local,
      version: Math.max(local.version, remote.version) + 1,
      updatedAt: Date.now(),
    }
  }
}

export const syncService = new SyncService()
