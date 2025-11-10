import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFPageData {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  imageData: string;
}

export class PDFRenderer {
  async renderPDFPages(file: File): Promise<PDFPageData[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: PDFPageData[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageData = canvas.toDataURL('image/png');

      pages.push({
        pageNumber: i,
        canvas,
        imageData,
      });
    }

    return pages;
  }

  async renderImageToCanvas(file: File): Promise<PDFPageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          const imageData = canvas.toDataURL('image/png');

          resolve({
            pageNumber: 1,
            canvas,
            imageData,
          });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async processFile(file: File): Promise<PDFPageData[]> {
    if (file.type === 'application/pdf') {
      return this.renderPDFPages(file);
    } else if (file.type.startsWith('image/')) {
      const pageData = await this.renderImageToCanvas(file);
      return [pageData];
    } else {
      throw new Error('Unsupported file type');
    }
  }
}

export const pdfRenderer = new PDFRenderer();
