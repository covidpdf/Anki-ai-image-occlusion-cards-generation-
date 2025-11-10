import { useState, useEffect } from 'react'
import { useDeckStore } from '../../store/deckStore'
import { Card, CardCreate, CardUpdate, Occlusion } from '../../types'

interface CardFormProps {
  card?: Card
  deckId: string
  onSubmit?: (card: Card) => void
  onCancel?: () => void
}

export function CardForm({ card, deckId, onSubmit, onCancel }: CardFormProps) {
  const { createCard, updateCard } = useDeckStore()

  const [front, setFront] = useState(card?.front || '')
  const [back, setBack] = useState(card?.back || '')
  const [imageUrl, setImageUrl] = useState(card?.imageUrl || '')
  const [notes, setNotes] = useState(card?.notes || '')
  const [tags, setTags] = useState<string[]>(card?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [occlusions, setOcclusions] = useState<Occlusion[]>(card?.occlusions || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (card) {
      setFront(card.front)
      setBack(card.back)
      setImageUrl(card.imageUrl || '')
      setNotes(card.notes || '')
      setTags(card.tags)
      setOcclusions(card.occlusions)
    }
  }, [card])

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

  const handleAddOcclusion = () => {
    const newOcclusion: Occlusion = {
      id: `occlusion-${Date.now()}`,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      label: `Occlusion ${occlusions.length + 1}`,
    }
    setOcclusions([...occlusions, newOcclusion])
  }

  const handleRemoveOcclusion = (occlusionId: string) => {
    setOcclusions(occlusions.filter((o) => o.id !== occlusionId))
  }

  const handleUpdateOcclusion = (occlusionId: string, updates: Partial<Occlusion>) => {
    setOcclusions(
      occlusions.map((o) => (o.id === occlusionId ? { ...o, ...updates } : o))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!front.trim()) {
      setError('Front text is required')
      return
    }

    if (!back.trim()) {
      setError('Back text is required')
      return
    }

    setIsSubmitting(true)

    try {
      if (card) {
        const updates: CardUpdate = {
          front: front.trim(),
          back: back.trim(),
          imageUrl: imageUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          tags,
          occlusions,
        }
        await updateCard(card.id, updates)
        const updatedCard = useDeckStore
          .getState()
          .cards.find((c) => c.id === card.id)
        if (updatedCard) {
          onSubmit?.(updatedCard)
        }
      } else {
        const cardData: CardCreate = {
          deckId,
          front: front.trim(),
          back: back.trim(),
          imageUrl: imageUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          tags,
          occlusions,
        }
        const newCard = await createCard(cardData)
        onSubmit?.(newCard)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-form">
      <h2>{card ? 'Edit Card' : 'Create Card'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="front">
          Front <span className="required">*</span>
        </label>
        <textarea
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Enter front text"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="back">
          Back <span className="required">*</span>
        </label>
        <textarea
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Enter back text"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Occlusions</label>
        <button type="button" onClick={handleAddOcclusion} className="add-occlusion-button">
          Add Occlusion
        </button>
        {occlusions.length > 0 && (
          <div className="occlusions-list">
            {occlusions.map((occlusion) => (
              <div key={occlusion.id} className="occlusion-item">
                <input
                  type="text"
                  value={occlusion.label || ''}
                  onChange={(e) =>
                    handleUpdateOcclusion(occlusion.id, { label: e.target.value })
                  }
                  placeholder="Label"
                />
                <input
                  type="number"
                  value={occlusion.x}
                  onChange={(e) =>
                    handleUpdateOcclusion(occlusion.id, { x: Number(e.target.value) })
                  }
                  placeholder="X"
                />
                <input
                  type="number"
                  value={occlusion.y}
                  onChange={(e) =>
                    handleUpdateOcclusion(occlusion.id, { y: Number(e.target.value) })
                  }
                  placeholder="Y"
                />
                <input
                  type="number"
                  value={occlusion.width}
                  onChange={(e) =>
                    handleUpdateOcclusion(occlusion.id, { width: Number(e.target.value) })
                  }
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={occlusion.height}
                  onChange={(e) =>
                    handleUpdateOcclusion(occlusion.id, {
                      height: Number(e.target.value),
                    })
                  }
                  placeholder="Height"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOcclusion(occlusion.id)}
                  className="remove-occlusion-button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
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
          {isSubmitting ? 'Saving...' : card ? 'Update Card' : 'Create Card'}
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  )
}
