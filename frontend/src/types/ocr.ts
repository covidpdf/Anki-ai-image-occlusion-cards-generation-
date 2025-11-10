export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Word {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface Line {
  text: string;
  words: Word[];
  bbox: BoundingBox;
  confidence: number;
}

export interface OCRResult {
  text: string;
  lines: Line[];
  confidence: number;
}

export interface PageOCRResult {
  pageNumber: number;
  imageData: string;
  ocrResult: OCRResult | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface UploadedFile {
  file: File;
  name: string;
  type: string;
  size: number;
  pages: PageOCRResult[];
}

export enum WizardStep {
  Upload = 0,
  Process = 1,
  Review = 2,
  Submit = 3,
}
