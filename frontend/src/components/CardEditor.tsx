/**
 * Card editor component for reviewing and editing generated cards
 */
import { useState } from 'react';
import type { GeneratedCard } from '../types/cards';
import '../styles/CardEditor.css';

interface CardEditorProps {
  cards: GeneratedCard[];
  ocrTextSummary?: string;
  totalConfidence: number;
  onApprove: (cardIndex: number, correctedCard: GeneratedCard) => void;
  onReject: (cardIndex: number) => void;
}

export function CardEditor({
  cards,
  ocrTextSummary,
  totalConfidence,
  onApprove,
  onReject,
}: CardEditorProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedFront, setEditedFront] = useState('');
  const [editedBack, setEditedBack] = useState('');
  const [notes, setNotes] = useState('');

  if (cards.length === 0) {
    return <div className="card-editor empty">No cards to review</div>;
  }

  const currentCard = cards[currentCardIndex];

  const handleEdit = () => {
    setEditMode(true);
    setEditedFront(currentCard.content.front);
    setEditedBack(currentCard.content.back);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNotes('');
  };

  const handleSaveEdit = () => {
    const correctedCard: GeneratedCard = {
      ...currentCard,
      content: {
        front: editedFront,
        back: editedBack,
      },
    };
    onApprove(currentCardIndex, correctedCard);
    setEditMode(false);
    setNotes('');
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleReject = () => {
    onReject(currentCardIndex);
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setEditMode(false);
      setNotes('');
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setEditMode(false);
      setNotes('');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.75) return 'medium';
    return 'low';
  };

  return (
    <div className="card-editor">
      <div className="editor-header">
        <h2>Card Review & Editor</h2>
        <div className="editor-stats">
          <span className="stat">
            Card {currentCardIndex + 1} of {cards.length}
          </span>
          <span className="stat">
            Avg Confidence:{' '}
            <span className={`confidence ${getConfidenceColor(totalConfidence)}`}>
              {(totalConfidence * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {ocrTextSummary && (
        <div className="ocr-summary">
          <h3>OCR Summary</h3>
          <p>{ocrTextSummary}</p>
        </div>
      )}

      <div className="card-container">
        <div className="card-display">
          {editMode ? (
            <div className="edit-mode">
              <div className="edit-field">
                <label htmlFor="front">Front (Question/Cloze)</label>
                <textarea
                  id="front"
                  value={editedFront}
                  onChange={(e) => setEditedFront(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="back">Back (Answer)</label>
                <textarea
                  id="back"
                  value={editedBack}
                  onChange={(e) => setEditedBack(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="edit-field">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add any notes about this card..."
                />
              </div>
            </div>
          ) : (
            <div className="view-mode">
              <div className="card-side front">
                <div className="side-label">Front</div>
                <div className="side-content">{currentCard.content.front}</div>
              </div>
              <div className="card-divider">↕</div>
              <div className="card-side back">
                <div className="side-label">Back</div>
                <div className="side-content">{currentCard.content.back}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card-metadata">
          <div className="metadata-item">
            <span className="label">Model:</span>
            <span className="value">{currentCard.model_used}</span>
          </div>
          <div className="metadata-item">
            <span className="label">Confidence:</span>
            <span className={`confidence ${getConfidenceColor(currentCard.confidence)}`}>
              {(currentCard.confidence * 100).toFixed(1)}%
            </span>
          </div>
          {currentCard.reasoning && (
            <div className="metadata-item">
              <span className="label">Reasoning:</span>
              <span className="value">{currentCard.reasoning}</span>
            </div>
          )}
        </div>
      </div>

      <div className="editor-actions">
        {!editMode ? (
          <>
            <button className="btn btn-primary" onClick={handleEdit}>
              Edit Card
            </button>
            <button className="btn btn-success" onClick={handleSaveEdit}>
              Approve
            </button>
            <button className="btn btn-danger" onClick={handleReject}>
              Reject
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleSaveEdit}>
              Save & Approve
            </button>
            <button className="btn btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="editor-navigation">
        <button className="btn btn-sm" onClick={handlePrevious} disabled={currentCardIndex === 0}>
          ← Previous
        </button>
        <span className="nav-indicator">
          {currentCardIndex + 1} / {cards.length}
        </span>
        <button
          className="btn btn-sm"
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
