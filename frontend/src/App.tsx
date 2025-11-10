import { useState } from 'react';
import { CardEditor } from './components/CardEditor';
import { CardGenerationForm } from './components/CardGenerationForm';
import type { CardGenerationResponse, GeneratedCard } from './types/cards';
import './App.css';

function App() {
  const [generatedCards, setGeneratedCards] = useState<CardGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvedCards, setApprovedCards] = useState<GeneratedCard[]>([]);

  const handleCardsGenerated = (response: CardGenerationResponse) => {
    setGeneratedCards(response);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleApproveCard = (_cardIndex: number, correctedCard: GeneratedCard) => {
    setApprovedCards([...approvedCards, correctedCard]);
  };

  const handleRejectCard = (cardIndex: number) => {
    console.log(`Card ${cardIndex} rejected`);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎴 Anki Image Occlusion Generator</h1>
        <p>Generate flashcards with AI-powered occlusions</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <button className="error-close" onClick={() => setError(null)} aria-label="Close error">
              ×
            </button>
            {error}
          </div>
        )}

        {approvedCards.length > 0 && (
          <div className="success-message">
            ✓ {approvedCards.length} card(s) approved and ready for export
          </div>
        )}

        {!generatedCards ? (
          <CardGenerationForm onCardsGenerated={handleCardsGenerated} onError={handleError} />
        ) : (
          <>
            <button className="btn-new-generation" onClick={() => setGeneratedCards(null)}>
              ← Generate New Cards
            </button>
            <CardEditor
              cards={generatedCards.cards}
              ocrTextSummary={generatedCards.ocr_text_summary}
              totalConfidence={generatedCards.total_confidence}
              onApprove={handleApproveCard}
              onReject={handleRejectCard}
            />
            {approvedCards.length > 0 && (
              <div className="export-section">
                <h3>Approved Cards: {approvedCards.length}</h3>
                <p className="export-info">
                  Your approved cards are ready. In a future update, you'll be able to export them
                  directly to Anki format.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
