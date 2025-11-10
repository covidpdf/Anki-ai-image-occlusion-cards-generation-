import { useEffect, useRef, useState } from 'react';
import type { PageOCRResult, BoundingBox } from '../types/ocr';

interface OCRViewerProps {
  page: PageOCRResult;
  onTextEdit?: (text: string) => void;
}

export const OCRViewer: React.FC<OCRViewerProps> = ({ page, onTextEdit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);
  const [editableText, setEditableText] = useState(
    page.ocrResult?.text || ''
  );

  useEffect(() => {
    if (!canvasRef.current || !page.imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (showBoundingBoxes && page.ocrResult) {
        page.ocrResult.lines.forEach((line) => {
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(line.bbox.x, line.bbox.y, line.bbox.width, line.bbox.height);

          line.words.forEach((word) => {
            ctx.strokeStyle = 'rgba(0, 0, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(word.bbox.x, word.bbox.y, word.bbox.width, word.bbox.height);
          });
        });
      }

      if (hoveredBox) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(hoveredBox.x, hoveredBox.y, hoveredBox.width, hoveredBox.height);
      }
    };
    img.src = page.imageData;
  }, [page, showBoundingBoxes, hoveredBox]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditableText(newText);
    onTextEdit?.(newText);
  };

  const handleLineHover = (bbox: BoundingBox | null) => {
    setHoveredBox(bbox);
  };

  return (
    <div className="ocr-viewer">
      <div className="ocr-viewer-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showBoundingBoxes}
            onChange={(e) => setShowBoundingBoxes(e.target.checked)}
          />
          Show Bounding Boxes
        </label>
        <div className="ocr-status">
          Status: <span className={`status-${page.status}`}>{page.status}</span>
        </div>
        {page.ocrResult && (
          <div className="ocr-confidence">
            Confidence: {Math.round(page.ocrResult.confidence)}%
          </div>
        )}
      </div>

      <div className="ocr-viewer-content">
        <div className="ocr-canvas-container">
          <canvas ref={canvasRef} className="ocr-canvas" />
        </div>

        <div className="ocr-text-container">
          <h3>Recognized Text (Page {page.pageNumber})</h3>
          
          {page.ocrResult && (
            <div className="ocr-lines">
              <h4>Lines (hover to highlight):</h4>
              <div className="lines-list">
                {page.ocrResult.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="line-item"
                    onMouseEnter={() => handleLineHover(line.bbox)}
                    onMouseLeave={() => handleLineHover(null)}
                  >
                    <span className="line-text">{line.text}</span>
                    <span className="line-confidence">
                      {Math.round(line.confidence)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ocr-editor">
            <h4>Edit Text:</h4>
            <textarea
              className="ocr-textarea"
              value={editableText}
              onChange={handleTextChange}
              placeholder="OCR text will appear here..."
              rows={15}
            />
          </div>
        </div>
      </div>

      {page.error && (
        <div className="ocr-error">
          Error: {page.error}
        </div>
      )}
    </div>
  );
};
