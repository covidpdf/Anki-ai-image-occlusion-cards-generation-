import { useEffect, useState } from 'react'
import { useDeckStore } from '../../store/deckStore'
import { useSyncStore } from '../../store/syncStore'
import { Deck } from '../../types'

interface DeckListProps {
  onSelectDeck?: (deck: Deck) => void
  onEditDeck?: (deck: Deck) => void
  onDeleteDeck?: (deck: Deck) => void
}

export function DeckList({ onSelectDeck, onEditDeck, onDeleteDeck }: DeckListProps) {
  const {
    loadDecks,
    deleteDeck,
    selectDeck,
    searchQuery,
    setSearchQuery,
    tagFilter,
    setTagFilter,
    getFilteredDecks,
  } = useDeckStore()

  const { startSync, isSyncing } = useSyncStore()

  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    loadDecks()
  }, [loadDecks])

  useEffect(() => {
    const store = useDeckStore.getState()
    const tags = new Set<string>()
    store.decks.forEach((deck) => deck.tags.forEach((tag) => tags.add(tag)))
    setAvailableTags(Array.from(tags))
  }, [useDeckStore.getState().decks.length])

  const filteredDecks = getFilteredDecks()

  const handleSync = async () => {
    await startSync()
    await loadDecks()
  }

  const handleDelete = async (deck: Deck) => {
    if (window.confirm(`Are you sure you want to delete "${deck.name}"?`)) {
      await deleteDeck(deck.id)
      onDeleteDeck?.(deck)
    }
  }

  const handleSelect = (deck: Deck) => {
    selectDeck(deck.id)
    onSelectDeck?.(deck)
  }

  const toggleTagFilter = (tag: string) => {
    if (tagFilter.includes(tag)) {
      setTagFilter(tagFilter.filter((t) => t !== tag))
    } else {
      setTagFilter([...tagFilter, tag])
    }
  }

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>My Decks</h2>
        <button onClick={handleSync} disabled={isSyncing} className="sync-button">
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      <div className="deck-list-filters">
        <input
          type="text"
          placeholder="Search decks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {availableTags.length > 0 && (
          <div className="tag-filters">
            <span>Filter by tags:</span>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`tag-filter ${tagFilter.includes(tag) ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
            {tagFilter.length > 0 && (
              <button onClick={() => setTagFilter([])} className="clear-filters">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="deck-list-items">
        {filteredDecks.length === 0 ? (
          <div className="empty-state">
            <p>No decks found. Create your first deck to get started!</p>
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <div key={deck.id} className="deck-item">
              <div className="deck-item-content" onClick={() => handleSelect(deck)}>
                <h3>{deck.name}</h3>
                {deck.description && <p className="deck-description">{deck.description}</p>}
                <div className="deck-meta">
                  <span className="card-count">{deck.cardCount} cards</span>
                  <span className={`sync-status ${deck.syncStatus}`}>{deck.syncStatus}</span>
                  {deck.tags.length > 0 && (
                    <div className="deck-tags">
                      {deck.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="deck-item-actions">
                <button onClick={() => onEditDeck?.(deck)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => handleDelete(deck)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
