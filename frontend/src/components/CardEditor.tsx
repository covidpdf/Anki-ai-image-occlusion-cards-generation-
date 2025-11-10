/** Component for creating and managing image occlusion cards */
import React, { useState, useRef, useCallback } from 'react';
import { ImageOcclusionCard, OcclusionMask } from '../types/export';
import { generateId, fileToBase64, validateImageFile } from '../utils/helpers';

interface CardEditorProps {
  card: ImageOcclusionCard;
  onCardChange: (card: ImageOcclusionCard) => void;
  onCardDelete: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({ card, onCardChange, onCardDelete }) => {
  const [isAddingOcclusion, setIsAddingOcclusion] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentOcclusion, setCurrentOcclusion] = useState<OcclusionMask | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onCardChange({
        ...card,
        image_data: base64,
        image_path: file.name,
      });
    } catch (error) {
      alert('Failed to process image: ' + error);
    }
  }, [card, onCardChange]);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingOcclusion || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!dragStart) {
      setDragStart({ x, y });
      setCurrentOcclusion({
        id: generateId(),
        x,
        y,
        width: 0,
        height: 0,
      });
    }
  }, [isAddingOcclusion, dragStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingOcclusion || !dragStart || !currentOcclusion || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const newOcclusion = {
      ...currentOcclusion,
      width: currentX - dragStart.x,
      height: currentY - dragStart.y,
    };

    setCurrentOcclusion(newOcclusion);
  }, [isAddingOcclusion, dragStart, currentOcclusion]);

  const handleMouseUp = useCallback(() => {
    if (!isAddingOcclusion || !currentOcclusion) return;

    if (currentOcclusion.width > 5 && currentOcclusion.height > 5) {
      // Normalize occlusion dimensions
      const normalizedOcclusion = {
        id: currentOcclusion.id,
        x: currentOcclusion.width < 0 ? currentOcclusion.x + currentOcclusion.width : currentOcclusion.x,
        y: currentOcclusion.height < 0 ? currentOcclusion.y + currentOcclusion.height : currentOcclusion.y,
        width: Math.abs(currentOcclusion.width),
        height: Math.abs(currentOcclusion.height),
      };

      onCardChange({
        ...card,
        occlusions: [...card.occlusions, normalizedOcclusion],
      });
    }

    setIsAddingOcclusion(false);
    setDragStart(null);
    setCurrentOcclusion(null);
  }, [isAddingOcclusion, currentOcclusion, card, onCardChange]);

  const removeOcclusion = useCallback((occlusionId: string) => {
    onCardChange({
      ...card,
      occlusions: card.occlusions.filter(occ => occ.id !== occlusionId),
    });
  }, [card, onCardChange]);

  return (
    <div className="card-editor">
      <div className="card-header">
        <h3>Card: {card.id}</h3>
        <button onClick={onCardDelete} className="delete-btn">Delete Card</button>
      </div>

      <div className="card-content">
        <div className="image-section">
          <div className="image-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()}>
              {card.image_data ? 'Change Image' : 'Upload Image'}
            </button>
            {card.image_data && (
              <button
                onClick={() => setIsAddingOcclusion(!isAddingOcclusion)}
                className={isAddingOcclusion ? 'active' : ''}
              >
                {isAddingOcclusion ? 'Cancel Occlusion' : 'Add Occlusion'}
              </button>
            )}
          </div>

          {card.image_data && (
            <div
              className="image-container"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isAddingOcclusion ? 'crosshair' : 'default' }}
            >
              <img
                ref={imageRef}
                src={card.image_data}
                alt="Card image"
                style={{ maxWidth: '100%', display: 'block' }}
              />
              
              {/* Render existing occlusions */}
              {card.occlusions.map(occlusion => (
                <div
                  key={occlusion.id}
                  className="occlusion"
                  style={{
                    position: 'absolute',
                    left: `${occlusion.x}px`,
                    top: `${occlusion.y}px`,
                    width: `${occlusion.width}px`,
                    height: `${occlusion.height}px`,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: '2px solid #ff4444',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAddingOcclusion) {
                      removeOcclusion(occlusion.id);
                    }
                  }}
                  title="Click to remove"
                />
              ))}
              
              {/* Render current occlusion being created */}
              {currentOcclusion && (
                <div
                  className="current-occlusion"
                  style={{
                    position: 'absolute',
                    left: `${currentOcclusion.x}px`,
                    top: `${currentOcclusion.y}px`,
                    width: `${Math.abs(currentOcclusion.width)}px`,
                    height: `${Math.abs(currentOcclusion.height)}px`,
                    backgroundColor: 'rgba(0, 0, 255, 0.5)',
                    border: '2px solid #0066ff',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="text-section">
          <div className="form-group">
            <label>Question:</label>
            <input
              type="text"
              value={card.question || ''}
              onChange={(e) => onCardChange({ ...card, question: e.target.value })}
              placeholder="Enter question text"
            />
          </div>

          <div className="form-group">
            <label>Answer:</label>
            <textarea
              value={card.answer || ''}
              onChange={(e) => onCardChange({ ...card, answer: e.target.value })}
              placeholder="Enter answer text"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated):</label>
            <input
              type="text"
              value={card.tags.join(', ')}
              onChange={(e) => onCardChange({
                ...card,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="occlusion-info">
            <p>Occlusions: {card.occlusions.length}</p>
            {card.occlusions.length > 0 && (
              <ul>
                {card.occlusions.map(occ => (
                  <li key={occ.id}>
                    {occ.id}: ({occ.x}, {occ.y}) {occ.width}×{occ.height}
                    <button
                      onClick={() => removeOcclusion(occ.id)}
                      style={{ marginLeft: '8px', padding: '2px 6px' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-editor {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          background: white;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-header h3 {
          margin: 0;
        }

        .delete-btn {
          background: #ff4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }

        .card-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .image-controls {
          margin-bottom: 12px;
        }

        .image-controls button {
          margin-right: 8px;
          padding: 6px 12px;
          border: 1px solid #ccc;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .image-controls button.active {
          background: #007bff;
          color: white;
        }

        .image-container {
          position: relative;
          display: inline-block;
          border: 2px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .occlusion-info {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .occlusion-info ul {
          margin: 4px 0 0 0;
          padding-left: 16px;
        }

        .occlusion-info li {
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
};