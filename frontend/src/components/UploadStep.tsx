import { useState } from 'react';

interface UploadStepProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function UploadStep({ onFileUpload, isLoading, error }: UploadStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="step">
      <h2>Step 1: Upload PDF</h2>

      <div
        className={`upload-area ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isLoading}
          style={{ display: 'none' }}
          aria-label="Upload PDF file"
        />
        <label htmlFor="file-input" className="upload-label">
          <div className="upload-icon">📄</div>
          <p>Drag and drop your PDF here or click to browse</p>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {isLoading ? 'Uploading...' : 'Select File'}
          </button>
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
