import { useState, useRef, useCallback, useEffect, type FC, type ChangeEvent, type DragEvent } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker?url'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

interface UploadWizardProps {
  onUploadSuccess?: (fileId: string) => void
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, JPEG, PNG, GIF, or WebP files.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 20MB limit.',
    }
  }

  return { valid: true }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const UploadWizard: FC<UploadWizardProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = workerSrc
  }, [])

  const generatePdfPreview = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const scale = Math.min(300 / viewport.width, 300 / viewport.height)
    const scaledViewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not get canvas context')

    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise

    return canvas.toDataURL()
  }, [])

  const generateImagePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          const scale = Math.min(300 / img.width, 300 / img.height, 1)
          canvas.width = img.width * scale
          canvas.height = img.height * scale

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL())
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }

      setError(null)
      setSelectedFile(file)

      try {
        let previewUrl: string
        if (file.type === 'application/pdf') {
          previewUrl = await generatePdfPreview(file)
        } else {
          previewUrl = await generateImagePreview(file)
        }
        setPreview(previewUrl)
      } catch (err) {
        setError('Failed to generate preview')
        console.error('Preview generation error:', err)
      }
    },
    [generatePdfPreview, generateImagePreview]
  )

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      onUploadSuccess?.(data.file_id)
      handleClear()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, onUploadSuccess, handleClear])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Upload & OCR</h2>
      <p className="mt-2 text-sm text-slate-600">
        Upload PDF, JPEG, PNG, GIF, or WebP files (max 20MB)
      </p>

      <div className="mt-6">
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-slate-900">
              Drag and drop a file here, or click to select
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF, JPEG, PNG, GIF, WebP (max 20MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {preview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-[300px] max-w-[300px] rounded border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={handleClear}
                disabled={isUploading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}

export default UploadWizard
