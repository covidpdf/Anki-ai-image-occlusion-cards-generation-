/** Component for managing deck export */
import React, { useState } from 'react';
import { DeckExportRequest, ImageOcclusionCard } from '../types/export';
import { apiService } from '../services/api';
import { downloadFile, generateId } from '../utils/helpers';
import { CardEditor } from './CardEditor';

export const DeckExporter: React.FC = () => {
  const [deckName, setDeckName] = useState('My Anki Deck');
  const [deckDescription, setDeckDescription] = useState('');
  const [deckTags, setDeckTags] = useState('');
  const [cards, setCards] = useState<ImageOcclusionCard[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const addCard = () => {
    const newCard: ImageOcclusionCard = {
      id: generateId(),
      occlusions: [],
      tags: [],
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (index: number, updatedCard: ImageOcclusionCard) => {
    const newCards = [...cards];
    newCards[index] = updatedCard;
    setCards(newCards);
  };

  const deleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const validateDeck = (): { valid: boolean; error?: string } => {
    if (!deckName.trim()) {
      return { valid: false, error: 'Deck name is required' };
    }

    if (cards.length === 0) {
      return { valid: false, error: 'At least one card is required' };
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card.image_data && !card.image_path) {
        return { valid: false, error: `Card ${i + 1} must have an image` };
      }
      if (card.occlusions.length === 0) {
        return { valid: false, error: `Card ${i + 1} must have at least one occlusion` };
      }
    }

    return { valid: true };
  };

  const handleExport = async () => {
    const validation = validateDeck();
    if (!validation.valid) {
      setExportStatus(`Error: ${validation.error}`);
      return;
    }

    setIsExporting(true);
    setExportStatus('Preparing export...');

    try {
      const exportRequest: DeckExportRequest = {
        deck_name: deckName.trim(),
        deck_description: deckDescription.trim() || undefined,
        cards: cards,
        tags: deckTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      setExportStatus('Generating .apkg file...');
      const response = await apiService.exportDeckToApkg(exportRequest);

      setExportStatus('Downloading file...');
      await downloadFile(response);

      setExportStatus('Export completed successfully!');
      setTimeout(() => setExportStatus(''), 3000);

    } catch (error) {
      setExportStatus(`Export failed: ${error}`);
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleValidate = async () => {
    const validation = validateDeck();
    if (!validation.valid) {
      setExportStatus(`Validation failed: ${validation.error}`);
      return;
    }

    try {
      const exportRequest: DeckExportRequest = {
        deck_name: deckName.trim(),
        deck_description: deckDescription.trim() || undefined,
        cards: cards,
        tags: deckTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const result = await apiService.validateExportRequest(exportRequest);
      setExportStatus(`Validation: ${result.valid ? 'Valid' : result.error}`);
    } catch (error) {
      setExportStatus(`Validation error: ${error}`);
    }
  };

  return (
    <div className="deck-exporter">
      <div className="deck-settings">
        <h2>Deck Settings</h2>
        
        <div className="form-group">
          <label>Deck Name:</label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Enter deck name"
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            placeholder="Enter deck description (optional)"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Tags (comma separated):</label>
          <input
            type="text"
            value={deckTags}
            onChange={(e) => setDeckTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="deck-actions">
          <button onClick={addCard} className="add-card-btn">
            Add Card
          </button>
          <button onClick={handleValidate} className="validate-btn">
            Validate Deck
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || cards.length === 0}
            className="export-btn"
          >
            {isExporting ? 'Exporting...' : 'Export to .apkg'}
          </button>
        </div>

        {exportStatus && (
          <div className={`export-status ${exportStatus.includes('Error') || exportStatus.includes('failed') ? 'error' : exportStatus.includes('success') ? 'success' : 'info'}`}>
            {exportStatus}
          </div>
        )}
      </div>

      <div className="cards-section">
        <h2>Cards ({cards.length})</h2>
        
        {cards.length === 0 ? (
          <div className="empty-state">
            <p>No cards yet. Click "Add Card" to get started.</p>
          </div>
        ) : (
          cards.map((card, index) => (
            <CardEditor
              key={card.id}
              card={card}
              onCardChange={(updatedCard) => updateCard(index, updatedCard)}
              onCardDelete={() => deleteCard(index)}
            />
          ))
        )}
      </div>

      <style jsx>{`
        .deck-exporter {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .deck-settings {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .deck-settings h2 {
          margin-top: 0;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .deck-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .add-card-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .validate-btn {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .export-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .export-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .export-status {
          padding: 8px 12px;
          border-radius: 4px;
          margin-top: 12px;
        }

        .export-status.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .export-status.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .export-status.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .cards-section {
          margin-top: 24px;
        }

        .cards-section h2 {
          margin-bottom: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 8px;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};