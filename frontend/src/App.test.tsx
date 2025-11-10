import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('./services/api', () => ({
  apiClient: {
    createSubmission: vi.fn(),
    getSubmission: vi.fn(),
    generateCards: vi.fn(),
    approveSubmission: vi.fn(),
    exportSubmission: vi.fn(),
    downloadSubmission: vi.fn(),
  },
}));

describe('App - E2E Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render initial upload step', () => {
    render(<App />);
    expect(screen.getByText(/Step 1: Upload PDF/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select File/i })).toBeInTheDocument();
  });

  it('should display workflow stepper with all steps', () => {
    render(<App />);
    const steps = ['Upload', 'Generate', 'Review', 'Export', 'Download'];
    steps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('should handle file upload and progress through workflow', async () => {
    const { apiClient } = await import('./services/api');

    const mockSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'uploaded' as const,
      cards: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.createSubmission).mockResolvedValueOnce(mockSubmission);

    render(<App />);

    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Generate Cards/i)).toBeInTheDocument();
    });
  });

  it('should handle card generation', async () => {
    const { apiClient } = await import('./services/api');

    const mockCards = [
      {
        id: '1',
        image_url: 'http://example.com/image.png',
        occlusions: [
          {
            id: 'occ-1',
            type: 'rectangle' as const,
            coordinates: [10, 20, 100, 50],
            text: 'term_1',
          },
        ],
        front_text: 'Question 1',
        back_text: 'Answer 1',
        approved: false,
      },
    ];

    const mockGeneratedSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'generated' as const,
      cards: mockCards,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockInitialSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'uploaded' as const,
      cards: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.createSubmission).mockResolvedValueOnce(mockInitialSubmission);
    vi.mocked(apiClient.generateCards).mockResolvedValueOnce(mockGeneratedSubmission);

    render(<App />);

    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Generate Cards/i)).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /Generate Cards/i });
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 3: Review & Approve Cards/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Answer 1/i)).toBeInTheDocument();
  });

  it('should handle card approval', async () => {
    const { apiClient } = await import('./services/api');

    const mockCards = [
      {
        id: '1',
        image_url: 'http://example.com/image.png',
        occlusions: [
          {
            id: 'occ-1',
            type: 'rectangle' as const,
            coordinates: [10, 20, 100, 50],
            text: 'term_1',
          },
        ],
        front_text: 'Question 1',
        back_text: 'Answer 1',
        approved: false,
      },
    ];

    const mockGeneratedSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'generated' as const,
      cards: mockCards,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockApprovedSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'approved' as const,
      cards: mockCards,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockInitialSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'uploaded' as const,
      cards: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.createSubmission).mockResolvedValueOnce(mockInitialSubmission);
    vi.mocked(apiClient.generateCards).mockResolvedValueOnce(mockGeneratedSubmission);
    vi.mocked(apiClient.approveSubmission).mockResolvedValueOnce(mockApprovedSubmission);

    render(<App />);

    // Upload file
    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Generate Cards/i)).toBeInTheDocument();
    });

    // Generate cards
    const generateButton = screen.getByRole('button', { name: /Generate Cards/i });
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 3: Review & Approve Cards/i)).toBeInTheDocument();
    });

    // Approve cards
    const approveButton = screen.getByRole('button', { name: /Approve & Continue/i });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 4: Export Deck/i)).toBeInTheDocument();
    });
  });

  it('should handle export and download', async () => {
    const { apiClient } = await import('./services/api');

    const mockCards = [
      {
        id: '1',
        image_url: 'http://example.com/image.png',
        occlusions: [
          {
            id: 'occ-1',
            type: 'rectangle' as const,
            coordinates: [10, 20, 100, 50],
            text: 'term_1',
          },
        ],
        front_text: 'Question 1',
        back_text: 'Answer 1',
        approved: false,
      },
    ];

    const mockGeneratedSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'generated' as const,
      cards: mockCards,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockApprovedSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'approved' as const,
      cards: mockCards,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockInitialSubmission = {
      id: 'test-123',
      filename: 'test.pdf',
      status: 'uploaded' as const,
      cards: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockExportResponse = {
      submission_id: 'test-123',
      download_url: '/api/submissions/test-123/download',
      filename: 'deck_test-123.apkg',
    };

    const mockDownloadResponse = {
      status: 'success',
      data: 'UEsDBAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLAQIUAAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLBQY=',
      filename: 'deck_test-123.apkg',
    };

    vi.mocked(apiClient.createSubmission).mockResolvedValueOnce(mockInitialSubmission);
    vi.mocked(apiClient.generateCards).mockResolvedValueOnce(mockGeneratedSubmission);
    vi.mocked(apiClient.approveSubmission).mockResolvedValueOnce(mockApprovedSubmission);
    vi.mocked(apiClient.exportSubmission).mockResolvedValueOnce(mockExportResponse);
    vi.mocked(apiClient.downloadSubmission).mockResolvedValueOnce(mockDownloadResponse);

    render(<App />);

    // Upload file
    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Generate Cards/i)).toBeInTheDocument();
    });

    // Generate cards
    let generateButton = screen.getByRole('button', { name: /Generate Cards/i });
    await userEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 3: Review & Approve Cards/i)).toBeInTheDocument();
    });

    // Approve cards
    const approveButton = screen.getByRole('button', { name: /Approve & Continue/i });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 4: Export Deck/i)).toBeInTheDocument();
    });

    // Export
    const exportButton = screen.getByRole('button', { name: /Export to Anki/i });
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 5: Download Deck/i)).toBeInTheDocument();
    });

    // Download
    const downloadButton = screen.getByRole('button', { name: /Download Deck/i });
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(apiClient.downloadSubmission).toHaveBeenCalledWith('test-123');
    });
  });

  it('should display error messages on API failures', async () => {
    const { apiClient } = await import('./services/api');

    const errorMessage = 'Upload failed: Invalid file';
    vi.mocked(apiClient.createSubmission).mockRejectedValueOnce(new Error(errorMessage));

    render(<App />);

    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
