import { useState, useEffect } from 'react'
import { useDeckStore } from '../../store/deckStore'
import { Deck, DeckCreate, DeckUpdate } from '../../types'

interface DeckFormProps {
  deck?: Deck
  onSubmit?: (deck: Deck) => void
  onCancel?: () => void
}

export function DeckForm({ deck, onSubmit, onCancel }: DeckFormProps) {
  const { createDeck, updateDeck } = useDeckStore()

  const [name, setName] = useState(deck?.name || '')
  const [description, setDescription] = useState(deck?.description || '')
  const [tags, setTags] = useState<string[]>(deck?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (deck) {
      setName(deck.name)
      setDescription(deck.description || '')
      setTags(deck.tags)
    }
  }, [deck])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Deck name is required')
      return
    }

    setIsSubmitting(true)

    try {
      if (deck) {
        const updates: DeckUpdate = {
          name: name.trim(),
          description: description.trim() || undefined,
          tags,
        }
        await updateDeck(deck.id, updates)
        const updatedDeck = useDeckStore.getState().getDeckById(deck.id)
        if (updatedDeck) {
          onSubmit?.(updatedDeck)
        }
      } else {
        const deckData: DeckCreate = {
          name: name.trim(),
          description: description.trim() || undefined,
          tags,
        }
        const newDeck = await createDeck(deckData)
        onSubmit?.(newDeck)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deck')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="deck-form">
      <h2>{deck ? 'Edit Deck' : 'Create Deck'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">
          Deck Name <span className="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter deck description (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="tag-input-container">
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tag and press Enter"
          />
          <button type="button" onClick={handleAddTag} className="add-tag-button">
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="tags-list">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="remove-tag-button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Saving...' : deck ? 'Update Deck' : 'Create Deck'}
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  )
}
