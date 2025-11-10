export interface Occlusion {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
}

export interface Card {
  id: string
  deckId: string
  front: string
  back: string
  imageUrl?: string
  occlusions: Occlusion[]
  notes?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  lastSyncedAt?: number
  syncStatus: 'synced' | 'pending' | 'conflict'
  version: number
}

export interface CardCreate {
  deckId: string
  front: string
  back: string
  imageUrl?: string
  occlusions?: Occlusion[]
  notes?: string
  tags?: string[]
}

export interface CardUpdate {
  front?: string
  back?: string
  imageUrl?: string
  occlusions?: Occlusion[]
  notes?: string
  tags?: string[]
}
