const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface OCRSubmission {
  filename: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    confidence: number;
  }>;
}

export interface OCRSubmissionResponse {
  id: string;
  filename: string;
  pageCount: number;
  totalConfidence: number;
  createdAt: string;
}

export const apiClient = {
  async submitOCR(data: OCRSubmission): Promise<OCRSubmissionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ocr/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};
