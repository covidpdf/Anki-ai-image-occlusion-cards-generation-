import { Card } from '../services/api';

interface CardReviewProps {
  card: Card;
  index: number;
  isApproved: boolean;
  onChange: (updatedCard: Card) => void;
}

export function CardReview({
  card,
  index,
  isApproved,
  onChange,
}: CardReviewProps) {
  const handleTextChange = (field: 'front_text' | 'back_text', value: string) => {
    onChange({
      ...card,
      [field]: value,
    });
  };

  return (
    <div className="card-review">
      <div className="card-preview">
        <div className="card-image">
          <img src={card.image_url} alt={`Card ${index + 1}`} />
          <div className="occlusions-overlay">
            {card.occlusions.map((occ, idx) => (
              <div
                key={idx}
                className="occlusion"
                style={{
                  left: `${occ.coordinates[0]}px`,
                  top: `${occ.coordinates[1]}px`,
                  width: `${occ.coordinates[2]}px`,
                  height: `${occ.coordinates[3]}px`,
                }}
                aria-label={`Occlusion ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="card-editor">
        <h3>Card {index + 1}</h3>

        <div className="form-group">
          <label htmlFor={`front-${index}`}>Front (Question)</label>
          <input
            id={`front-${index}`}
            type="text"
            value={card.front_text}
            onChange={(e) => handleTextChange('front_text', e.target.value)}
            disabled={isApproved}
            aria-label="Card front text"
          />
        </div>

        <div className="form-group">
          <label htmlFor={`back-${index}`}>Back (Answer)</label>
          <textarea
            id={`back-${index}`}
            value={card.back_text}
            onChange={(e) => handleTextChange('back_text', e.target.value)}
            disabled={isApproved}
            aria-label="Card back text"
          />
        </div>

        {isApproved && (
          <div className="status-approved">
            <span>✓ Approved</span>
          </div>
        )}
      </div>
    </div>
  );
}
