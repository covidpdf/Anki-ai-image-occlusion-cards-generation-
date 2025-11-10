import { createWorker } from 'tesseract.js';
import type { OCRResult, Line, Word, BoundingBox } from '../types/ocr';

export class OCRService {
  private worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  async initialize(): Promise<void> {
    if (this.worker) {
      return;
    }

    this.worker = await createWorker('eng', 1, {
      logger: (m) => console.log('[Tesseract]', m),
    });
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async recognizeImage(imageData: string): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('Failed to initialize OCR worker');
    }

    const result = await this.worker.recognize(imageData);

    const lines: Line[] = result.data.lines.map((line) => {
      const words: Word[] = line.words.map((word) => ({
        text: word.text,
        bbox: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        } as BoundingBox,
        confidence: word.confidence,
      }));

      return {
        text: line.text,
        words,
        bbox: {
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: line.bbox.x1 - line.bbox.x0,
          height: line.bbox.y1 - line.bbox.y0,
        } as BoundingBox,
        confidence: line.confidence,
      };
    });

    return {
      text: result.data.text,
      lines,
      confidence: result.data.confidence,
    };
  }

  async recognizeCanvas(canvas: HTMLCanvasElement): Promise<OCRResult> {
    const imageData = canvas.toDataURL('image/png');
    return this.recognizeImage(imageData);
  }
}

export const ocrService = new OCRService();
