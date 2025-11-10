import { useEffect, useState, useCallback } from 'react';
import { getAllDecks, addDeck, updateDeck, deleteDeck, getDeck, type Deck } from '../services/db';

export function useDeckStore() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const allDecks = await getAllDecks();
      setDecks(allDecks);
    } catch (err) {
      setError(String(err));
      console.error('Failed to load decks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeck = useCallback(
    async (name: string, description?: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const now = Date.now();
        const deck: Deck = {
          id: `deck_${now}`,
          name,
          description,
          createdAt: now,
          updatedAt: now,
          cardCount: 0,
        };
        const id = await addDeck(deck);
        await loadDecks();
        return id as string;
      } catch (err) {
        const errorMsg = String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDecks]
  );

  const updateDeckName = useCallback(
    async (id: string, name: string, description?: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const deck = await getDeck(id);
        if (!deck) throw new Error('Deck not found');
        deck.name = name;
        if (description !== undefined) deck.description = description;
        deck.updatedAt = Date.now();
        await updateDeck(deck);
        await loadDecks();
      } catch (err) {
        setError(String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDecks]
  );

  const removeDeck = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await deleteDeck(id);
        await loadDecks();
      } catch (err) {
        setError(String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDecks]
  );

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  return {
    decks,
    loading,
    error,
    createDeck,
    updateDeckName,
    removeDeck,
    refresh: loadDecks,
  };
}
