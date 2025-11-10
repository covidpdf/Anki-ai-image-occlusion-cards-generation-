/**
 * API client for communicating with backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Occlusion {
  id?: string;
  type: 'rectangle' | 'ellipse' | 'polygon';
  coordinates: number[];
  text?: string;
}

export interface Card {
  id?: string;
  image_url: string;
  occlusions: Occlusion[];
  front_text: string;
  back_text: string;
  approved: boolean;
}

export interface Submission {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'generated' | 'approved' | 'exported';
  cards: Card[];
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || `API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  async createSubmission(file: File): Promise<Submission> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_URL}/api/submissions`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  async getSubmission(submissionId: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}`);
  }

  async generateCards(submissionId: string): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}/generate`, {
      method: 'POST',
    });
  }

  async approveSubmission(submissionId: string, cards: Card[]): Promise<Submission> {
    return this.request<Submission>(`/api/submissions/${submissionId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        cards,
        notes: 'Approved by user',
      }),
    });
  }

  async exportSubmission(
    submissionId: string
  ): Promise<{ submission_id: string; download_url: string; filename: string }> {
    return this.request(`/api/submissions/${submissionId}/export`, {
      method: 'POST',
    });
  }

  async downloadSubmission(submissionId: string): Promise<any> {
    return this.request(`/api/submissions/${submissionId}/download`);
  }
}

export const apiClient = new ApiClient();
