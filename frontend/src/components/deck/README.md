# Deck Management System

## Overview

This deck management system provides a complete offline-first solution for managing Anki flashcard decks with advanced features including:

- **Offline storage** using IndexedDB (via Dexie)
- **State management** using Zustand
- **Automatic sync** with backend API
- **Conflict resolution** for concurrent edits
- **Search and filtering** by name, description, and tags
- **Card management** with support for image occlusions

## Architecture

### Data Flow

```
UI Components → Zustand Store → Dexie (IndexedDB) ⇄ Sync Service → Backend API
```

### Key Components

#### Database Layer (`src/db/`)
- **database.ts**: Dexie schema and configuration
  - Stores decks and cards in IndexedDB
  - Supports offline access and persistence

#### State Management (`src/store/`)
- **deckStore.ts**: Main store for deck and card operations
  - CRUD operations for decks and cards
  - Search and filtering functionality
  - Automatic IndexedDB persistence
  
- **syncStore.ts**: Sync state and conflict management
  - Tracks sync status
  - Manages conflicts between local and remote versions
  - Error handling

#### Services (`src/services/`)
- **deckApiService.ts**: Backend API client
  - RESTful API calls to backend
  - Handles network requests
  
- **syncService.ts**: Sync and conflict resolution
  - Push local changes to server
  - Pull remote changes to local
  - Detect and resolve conflicts

#### UI Components (`src/components/deck/`)
- **DeckManager.tsx**: Main container component
- **DeckList.tsx**: Display and filter decks
- **DeckForm.tsx**: Create/edit deck
- **CardForm.tsx**: Create/edit card with occlusion support

## Usage

### Creating a Deck

```typescript
import { useDeckStore } from '../../store/deckStore'

const { createDeck } = useDeckStore()

const deck = await createDeck({
  name: 'My Deck',
  description: 'Description',
  tags: ['math', 'algebra']
})
```

### Creating a Card

```typescript
const { createCard } = useDeckStore()

const card = await createCard({
  deckId: 'deck-id',
  front: 'Question',
  back: 'Answer',
  tags: ['important'],
  occlusions: [
    {
      id: 'occ-1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      label: 'Region 1'
    }
  ]
})
```

### Syncing Data

```typescript
import { useSyncStore } from '../../store/syncStore'

const { startSync } = useSyncStore()

const result = await startSync()
console.log(`Synced ${result.synced} items, ${result.conflicts} conflicts`)
```

### Resolving Conflicts

```typescript
const { resolveConflict } = useSyncStore()

// Choose local version
await resolveConflict(conflict.id, 'local')

// Choose remote version
await resolveConflict(conflict.id, 'remote')

// Merge both versions
await resolveConflict(conflict.id, 'merge')
```

### Searching and Filtering

```typescript
const { setSearchQuery, setTagFilter, getFilteredDecks } = useDeckStore()

// Search by name/description
setSearchQuery('math')

// Filter by tags
setTagFilter(['algebra', 'geometry'])

// Get filtered results
const decks = getFilteredDecks()
```

## Data Models

### Deck

```typescript
interface Deck {
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
```

### Card

```typescript
interface Card {
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
```

### Occlusion

```typescript
interface Occlusion {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
}
```

## Sync Strategy

### Push (Local → Remote)

1. Find all entities with `syncStatus: 'pending'`
2. Check if entity exists on server
3. If new: Create on server
4. If existing: Compare versions
   - If local is newer: Update server
   - If remote is newer: Create conflict
5. Mark as `synced` on success

### Pull (Remote → Local)

1. Fetch all entities from server
2. For each remote entity:
   - If not in local DB: Add it
   - If in local DB: Compare versions
     - If remote is newer: Create conflict

### Conflict Resolution

When a conflict is detected (both local and remote have been modified):

1. Create a `SyncConflict` record
2. Present both versions to user
3. User chooses resolution:
   - **Local**: Keep local changes, push to server
   - **Remote**: Accept remote changes, update local
   - **Merge**: Combine both (manual merge logic)
4. Apply resolution and mark as resolved

## Testing

### Running Tests

```bash
pnpm test
```

### Test Coverage

- **Database tests**: IndexedDB operations
- **Store tests**: State management and CRUD
- **Service tests**: Sync and conflict resolution
- **Component tests**: UI interactions

### Example Test

```typescript
it('should create a deck', async () => {
  const store = useDeckStore.getState()
  const deck = await store.createDeck({
    name: 'Test Deck',
    description: 'A test deck',
    tags: ['test']
  })

  expect(deck.name).toBe('Test Deck')
  expect(deck.syncStatus).toBe('pending')
})
```

## Offline Support

The system works completely offline:

1. All operations save to IndexedDB first
2. Marked as `pending` sync status
3. When online, sync automatically pushes changes
4. Data persists across page reloads

## Performance Considerations

- **Lazy loading**: Cards loaded only for selected deck
- **Indexed queries**: Fast searches using Dexie indexes
- **Transaction batching**: Multiple operations in single transaction
- **Optimistic updates**: UI updates immediately, sync in background

## Future Enhancements

- [ ] Automatic background sync
- [ ] Service Worker for true offline PWA
- [ ] Image upload and storage
- [ ] Advanced occlusion editor with canvas
- [ ] Export/import deck packages
- [ ] Collaborative editing
- [ ] Real-time sync via WebSockets
