import { useEffect, useState } from 'react';
import {
  addDeck,
  getAllDecks,
  deleteDeck,
  addOCRResult,
  addOcclusionMetadata,
  addToExportQueue,
  type Deck,
  type OCRResult,
  type OcclusionMetadata,
  type ExportQueue,
} from '../services/db';
import '../styles/DeckExample.css';

export function DeckExample(): JSX.Element {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async (): Promise<void> => {
    try {
      const allDecks = await getAllDecks();
      setDecks(allDecks);
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    setLoading(true);
    try {
      const now = Date.now();
      const deck: Deck = {
        id: `deck_${now}`,
        name: newDeckName,
        description: 'Created offline',
        createdAt: now,
        updatedAt: now,
        cardCount: 0,
      };

      await addDeck(deck);

      // Demo: Add OCR result
      const ocrResult: OCRResult = {
        id: `ocr_${now}`,
        deckId: deck.id,
        imageUrl: 'demo-image.jpg',
        text: 'Sample OCR text',
        confidence: 0.95,
        createdAt: now,
      };
      await addOCRResult(ocrResult);

      // Demo: Add occlusion metadata
      const occlusionData: OcclusionMetadata = {
        id: `occ_${now}`,
        deckId: deck.id,
        cardIndex: 0,
        occlusionRegions: [{ x: 10, y: 10, width: 100, height: 100, label: 'Region 1' }],
        createdAt: now,
        updatedAt: now,
      };
      await addOcclusionMetadata(occlusionData);

      // Demo: Queue for export
      const exportItem: ExportQueue = {
        id: `export_${now}`,
        deckId: deck.id,
        exportType: 'all',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        data: { deckName: deck.name },
      };
      await addToExportQueue(exportItem);

      setMessage({ type: 'success', text: `Deck "${newDeckName}" created successfully!` });
      setNewDeckName('');
      await loadDecks();
    } catch (error) {
      console.error('Failed to create deck:', error);
      setMessage({ type: 'error', text: 'Failed to create deck' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (id: string): Promise<void> => {
    if (!window.confirm('Delete this deck?')) return;

    setLoading(true);
    try {
      await deleteDeck(id);
      setMessage({ type: 'success', text: 'Deck deleted' });
      await loadDecks();
    } catch (error) {
      console.error('Failed to delete deck:', error);
      setMessage({ type: 'error', text: 'Failed to delete deck' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deck-example">
      <h3>Offline Deck Manager (Demo)</h3>

      {message && <div className={`message message-${message.type}`}>{message.text}</div>}

      <form onSubmit={handleCreateDeck} className="deck-form">
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="Enter deck name"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Deck'}
        </button>
      </form>

      <div className="deck-list">
        <h4>Stored Decks ({decks.length})</h4>
        {decks.length === 0 ? (
          <p className="empty-state">No decks yet. Create one above!</p>
        ) : (
          <ul>
            {decks.map((deck) => (
              <li key={deck.id} className="deck-item">
                <div className="deck-info">
                  <strong>{deck.name}</strong>
                  <small>{deck.description}</small>
                  <small>Cards: {deck.cardCount}</small>
                </div>
                <button
                  onClick={() => handleDeleteDeck(deck.id)}
                  className="delete-btn"
                  disabled={loading}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
