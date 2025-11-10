/** API service for communicating with the backend */
import { DeckExportRequest, ExportInfo } from '../types/export';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    // For file downloads, return the response as is
    return response as unknown as T;
  }

  async exportDeckToApkg(request: DeckExportRequest): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/api/v1/export/apkg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${response.status} - ${errorText}`);
    }

    return response;
  }

  async validateExportRequest(request: DeckExportRequest) {
    return this.request('/api/v1/export/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExportInfo(): Promise<ExportInfo> {
    return this.request('/api/v1/export/info');
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();