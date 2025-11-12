import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadWizard, { validateFile, formatFileSize } from './UploadWizard'

const mockGetPage = vi.fn().mockResolvedValue({
  getViewport: ({ scale }: { scale: number }) => ({ width: 200 * scale, height: 200 * scale }),
  render: () => ({ promise: Promise.resolve() }),
})

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      getPage: mockGetPage,
    }),
  }),
}))

vi.mock('pdfjs-dist/build/pdf.worker?url', () => ({
  default: '/pdf.worker.js',
}))

global.fetch = vi.fn() as unknown as typeof fetch

describe('UploadWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the upload zone', () => {
    render(<UploadWizard />)
    expect(screen.getByText('Upload & OCR')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop a file here/i)).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = render(<UploadWizard />)
    expect(container).toMatchSnapshot()
  })

  it('displays selected file name and size', async () => {
    render(<UploadWizard />)

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
  })

  it('shows clear and upload buttons when file is selected', async () => {
    render(<UploadWizard />)

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('Upload')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })
  })

  it('clears file when clear button is clicked', async () => {
    render(<UploadWizard />)

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear')
    await userEvent.click(clearButton)

    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
    expect(screen.getByText(/Drag and drop a file here/i)).toBeInTheDocument()
  })

  it('calls onUploadSuccess when upload is successful', async () => {
    const mockOnUploadSuccess = vi.fn()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ file_id: 'test-file-id' }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    render(<UploadWizard onUploadSuccess={mockOnUploadSuccess} />)

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('Upload')).toBeInTheDocument()
    })

    const uploadButton = screen.getByText('Upload')
    await userEvent.click(uploadButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.any(Object))
      expect(mockOnUploadSuccess).toHaveBeenCalledWith('test-file-id')
    })
  })

  it('shows error when upload fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Upload failed' }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    render(<UploadWizard />)

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('Upload')).toBeInTheDocument()
    })

    const uploadButton = screen.getByText('Upload')
    await userEvent.click(uploadButton)

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })
  })

  it('handles drag and drop', async () => {
    render(<UploadWizard />)

    const dropZone = screen.getByText(/Drag and drop a file here/i).closest('div')!
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.dragOver(dropZone)
    expect(dropZone.className).toContain('border-blue-500')

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })
  })
})

describe('validateFile', () => {
  it('validates correct file types', () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    expect(validateFile(pdfFile)).toEqual({ valid: true })

    const jpegFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    expect(validateFile(jpegFile)).toEqual({ valid: true })

    const pngFile = new File(['content'], 'test.png', { type: 'image/png' })
    expect(validateFile(pngFile)).toEqual({ valid: true })

    const gifFile = new File(['content'], 'test.gif', { type: 'image/gif' })
    expect(validateFile(gifFile)).toEqual({ valid: true })

    const webpFile = new File(['content'], 'test.webp', { type: 'image/webp' })
    expect(validateFile(webpFile)).toEqual({ valid: true })
  })

  it('rejects invalid file types', () => {
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const result = validateFile(invalidFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid file type')
  })

  it('rejects files larger than 20MB', () => {
    const largeFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'test.pdf', {
      type: 'application/pdf',
    })
    const result = validateFile(largeFile)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds 20MB limit')
  })

  it('accepts files exactly at 20MB limit', () => {
    const maxFile = new File([new ArrayBuffer(20 * 1024 * 1024)], 'test.pdf', {
      type: 'application/pdf',
    })
    const result = validateFile(maxFile)
    expect(result.valid).toBe(true)
  })
})

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(formatFileSize(1536)).toBe('1.50 KB')
  })

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB')
    expect(formatFileSize(15.5 * 1024 * 1024)).toBe('15.50 MB')
  })
})
