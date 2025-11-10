export interface SyncState {
  isSyncing: boolean
  lastSyncAt?: number
  syncErrors: SyncError[]
  conflicts: SyncConflict[]
}

export interface SyncError {
  id: string
  entityType: 'deck' | 'card'
  entityId: string
  error: string
  timestamp: number
}

export interface SyncConflict {
  id: string
  entityType: 'deck' | 'card'
  entityId: string
  localVersion: unknown
  remoteVersion: unknown
  timestamp: number
  resolved: boolean
}

export type ConflictResolution = 'local' | 'remote' | 'merge'

export interface SyncResult {
  success: boolean
  synced: number
  conflicts: SyncConflict[]
  errors: SyncError[]
}
