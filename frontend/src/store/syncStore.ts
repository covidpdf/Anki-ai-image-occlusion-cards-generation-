import { create } from 'zustand'
import { SyncState, SyncError, SyncConflict, ConflictResolution, SyncResult } from '../types'
import { syncService } from '../services/syncService'

interface SyncStoreState extends SyncState {
  // Actions
  startSync: () => Promise<SyncResult>
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<void>
  clearErrors: () => void
  clearConflicts: () => void
  addError: (error: SyncError) => void
  addConflict: (conflict: SyncConflict) => void
  removeConflict: (conflictId: string) => void
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  isSyncing: false,
  lastSyncAt: undefined,
  syncErrors: [],
  conflicts: [],

  startSync: async () => {
    if (get().isSyncing) {
      return {
        success: false,
        synced: 0,
        conflicts: [],
        errors: [
          {
            id: 'sync-in-progress',
            entityType: 'deck' as const,
            entityId: '',
            error: 'Sync already in progress',
            timestamp: Date.now(),
          },
        ],
      }
    }

    set({ isSyncing: true, syncErrors: [] })

    try {
      const result = await syncService.syncAll()
      
      set({
        isSyncing: false,
        lastSyncAt: Date.now(),
        syncErrors: result.errors,
        conflicts: result.conflicts.map((c: SyncConflict) => ({
          ...c,
          resolved: false,
        })),
      })

      return result
    } catch (error) {
      const syncError: SyncError = {
        id: 'sync-failed',
        entityType: 'deck',
        entityId: '',
        error: error instanceof Error ? error.message : 'Unknown sync error',
        timestamp: Date.now(),
      }

      set({
        isSyncing: false,
        syncErrors: [syncError],
      })

      return {
        success: false,
        synced: 0,
        conflicts: [],
        errors: [syncError],
      }
    }
  },

  resolveConflict: async (conflictId: string, resolution: ConflictResolution) => {
    const conflict = get().conflicts.find((c) => c.id === conflictId)
    if (!conflict) return

    try {
      await syncService.resolveConflict(conflict, resolution)
      
      set((state) => ({
        conflicts: state.conflicts.map((c) =>
          c.id === conflictId ? { ...c, resolved: true } : c
        ),
      }))

      setTimeout(() => {
        set((state) => ({
          conflicts: state.conflicts.filter((c) => c.id !== conflictId),
        }))
      }, 1000)
    } catch (error) {
      const syncError: SyncError = {
        id: `conflict-resolution-${conflictId}`,
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        error: error instanceof Error ? error.message : 'Failed to resolve conflict',
        timestamp: Date.now(),
      }

      set((state) => ({
        syncErrors: [...state.syncErrors, syncError],
      }))
    }
  },

  clearErrors: () => {
    set({ syncErrors: [] })
  },

  clearConflicts: () => {
    set({ conflicts: [] })
  },

  addError: (error: SyncError) => {
    set((state) => ({
      syncErrors: [...state.syncErrors, error],
    }))
  },

  addConflict: (conflict: SyncConflict) => {
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    }))
  },

  removeConflict: (conflictId: string) => {
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.id !== conflictId),
    }))
  },
}))
