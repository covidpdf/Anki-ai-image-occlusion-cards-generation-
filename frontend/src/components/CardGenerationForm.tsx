/**
 * Card generation form component
 */
import { useState } from 'react';
import type {
  CardGenerationRequest,
  CardGenerationResponse,
  OcclusionRegion,
} from '../types/cards';
import { api } from '../services/api';
import '../styles/CardGenerationForm.css';

interface CardGenerationFormProps {
  onCardsGenerated: (response: CardGenerationResponse) => void;
  onError: (error: string) => void;
}

export function CardGenerationForm({ onCardsGenerated, onError }: CardGenerationFormProps) {
  const [ocrText, setOcrText] = useState('');
  const [occlusions, setOcclusions] = useState<OcclusionRegion[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [cardType, setCardType] = useState<'cloze' | 'qa'>('cloze');
  const [loading, setLoading] = useState(false);
  const [occlusionInput, setOcclusionInput] = useState('');

  const handleAddOcclusion = () => {
    if (occlusionInput.trim()) {
      const newOcclusion: OcclusionRegion = {
        x: occlusions.length * 10,
        y: occlusions.length * 10,
        width: 100,
        height: 50,
        text: occlusionInput.trim(),
      };
      setOcclusions([...occlusions, newOcclusion]);
      setOcclusionInput('');
    }
  };

  const handleRemoveOcclusion = (index: number) => {
    setOcclusions(occlusions.filter((_, i) => i !== index));
  };

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ocrText.trim()) {
      onError('Please enter OCR text');
      return;
    }

    if (occlusions.length === 0) {
      onError('Please add at least one occlusion');
      return;
    }

    setLoading(true);

    try {
      const request: CardGenerationRequest = {
        ocr_text: ocrText,
        occlusions,
        user_prompt: userPrompt || undefined,
        card_type: cardType,
      };

      const response = await api.generateCards(request);
      onCardsGenerated(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(`Failed to generate cards: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card-generation-form" onSubmit={handleGenerateCards}>
      <div className="form-group">
        <label htmlFor="ocr-text">OCR Text *</label>
        <textarea
          id="ocr-text"
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          placeholder="Enter the OCR text extracted from the image..."
          rows={6}
          required
        />
      </div>

      <div className="form-group">
        <label>Card Type *</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              value="cloze"
              checked={cardType === 'cloze'}
              onChange={(e) => setCardType(e.target.value as 'cloze' | 'qa')}
            />
            Cloze Deletion
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="qa"
              checked={cardType === 'qa'}
              onChange={(e) => setCardType(e.target.value as 'cloze' | 'qa')}
            />
            Question & Answer
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Occlusions *</label>
        <div className="occlusion-input">
          <input
            type="text"
            value={occlusionInput}
            onChange={(e) => setOcclusionInput(e.target.value)}
            placeholder="Enter text to occlude/ask about..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOcclusion();
              }
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={handleAddOcclusion}>
            Add
          </button>
        </div>

        {occlusions.length > 0 && (
          <div className="occlusions-list">
            {occlusions.map((occ, index) => (
              <div key={index} className="occlusion-tag">
                <span className="occlusion-text">{occ.text}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveOcclusion(index)}
                  aria-label="Remove occlusion"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="user-prompt">User Prompt (Optional)</label>
        <textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Add optional guidance for card generation..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading || !ocrText.trim() || occlusions.length === 0}
      >
        {loading ? 'Generating Cards...' : 'Generate Cards'}
      </button>
    </form>
  );
}
