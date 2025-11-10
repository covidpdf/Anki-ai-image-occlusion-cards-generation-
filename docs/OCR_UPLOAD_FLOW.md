# OCR Upload Flow Documentation

## Overview

This document describes the OCR upload flow implemented for processing PDF and image files with optical character recognition (OCR) capabilities.

## Features

### Frontend

#### 1. Upload Wizard with Stepper UI
- Multi-step wizard interface guiding users through the OCR process
- Steps:
  1. **Upload**: Select and upload PDF or image files
  2. **Process**: Automatic OCR processing with progress indication
  3. **Review**: Review and edit extracted text with bounding box visualization
  4. **Submit**: Submit processed text for AI processing

#### 2. File Upload Component
- **Drag and drop** support for intuitive file selection
- **File validation**:
  - Supported formats: PDF, JPG, PNG
  - Maximum file size: 50MB (configurable)
  - Real-time error feedback
- **File type detection** for PDFs and images

#### 3. PDF Rendering with PDF.js
- Renders PDF pages to canvas elements at 2x scale for high quality
- Supports multi-page PDF documents
- Converts pages to images for OCR processing
- Handles image files directly

#### 4. OCR Processing with Tesseract.js
- **Web Worker-based processing** for non-blocking UI
- Processes each page independently
- Real-time progress updates
- Automatic initialization and cleanup
- Supports multiple languages (default: English)

#### 5. OCR Viewer
- **Visual canvas display** showing the original image/page
- **Bounding box highlighting**:
  - Green boxes for lines
  - Blue boxes for individual words
  - Red highlight on hover
- **Interactive line list** with hover-to-highlight functionality
- **Confidence scores** displayed per line and for entire page
- **Text editor** for manual corrections and cleanup
- **Multi-page navigation** for documents with multiple pages

### Backend

#### 1. OCR Submission Endpoint
- **Endpoint**: `POST /api/ocr/submit`
- **Purpose**: Receives processed OCR text and metadata for further AI processing
- **Request Schema**:
  ```json
  {
    "filename": "document.pdf",
    "pages": [
      {
        "pageNumber": 1,
        "text": "Extracted text content...",
        "confidence": 95.5
      }
    ]
  }
  ```
- **Response Schema**:
  ```json
  {
    "id": "uuid",
    "filename": "document.pdf",
    "pageCount": 1,
    "totalConfidence": 95.5,
    "createdAt": "2024-01-01T00:00:00Z"
  }
  ```

#### 2. Submission Retrieval
- **Get by ID**: `GET /api/ocr/submissions/{id}`
- **List all**: `GET /api/ocr/submissions`

#### 3. Integration Tests
Comprehensive test coverage including:
- Single page image OCR
- Multi-page PDF documents (5, 50+ pages)
- Large anatomy images (4K, 8K resolution)
- Medical terminology and special characters
- Unicode symbols (♀, ♂, ⚕, ℞, etc.)
- Edge cases (low confidence, empty text, mixed quality)
- Validation tests (invalid confidence, negative page numbers, etc.)

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **pdf.js 5.4.x**: PDF rendering
- **Tesseract.js 6.0.x**: OCR processing
- **Vite**: Build tool

### Backend
- **FastAPI 0.109.0**: Web framework
- **Pydantic 2.5.2**: Data validation
- **pytest**: Testing framework

## File Structure

### Frontend
```
frontend/src/
├── components/
│   ├── FileUpload.tsx       # Drag-drop file upload
│   ├── Stepper.tsx          # Wizard stepper UI
│   ├── OCRViewer.tsx        # OCR results viewer with bounding boxes
│   └── styles.css           # Component styles
├── pages/
│   └── UploadWizard.tsx     # Main wizard page
├── services/
│   ├── api.ts               # Backend API client
│   ├── pdfRenderer.ts       # PDF.js integration
│   └── ocrService.ts        # Tesseract.js integration
├── types/
│   └── ocr.ts               # TypeScript type definitions
└── App.tsx                  # Main app component
```

### Backend
```
backend/app/
├── api/
│   └── ocr.py               # OCR endpoints
├── schemas/
│   └── ocr.py               # Pydantic schemas
├── services/
│   └── ocr_service.py       # OCR business logic
└── tests/
    └── test_ocr.py          # Integration tests
```

## Usage

### Development Setup

#### Frontend
```bash
cd frontend
pnpm install
pnpm dev  # Starts on http://localhost:5173
```

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # Starts on http://localhost:8000
```

### Environment Variables

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate
pytest tests/test_ocr.py -v

# Frontend tests (when available)
cd frontend
pnpm test
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Performance Considerations

### Frontend
- PDF pages rendered at 2x scale for quality
- OCR processing runs in Web Worker (non-blocking)
- Canvas elements reused for memory efficiency
- Progress indicators for long-running operations

### Backend
- In-memory storage (suitable for development)
- Stateless endpoint design
- Efficient JSON serialization with Pydantic
- Comprehensive validation before processing

## Future Enhancements

1. **Database integration** for persistent storage
2. **Background job processing** for large documents
3. **Multiple language support** in OCR
4. **Batch upload** for multiple files
5. **Export options** (JSON, CSV, TXT)
6. **AI-powered text correction** and entity extraction
7. **Anki card generation** from OCR results
8. **Image preprocessing** (rotation, contrast adjustment)
9. **Progress persistence** (resume interrupted sessions)
10. **Cloud storage integration** for uploaded files

## Known Limitations

- Maximum file size: 50MB
- OCR accuracy depends on image quality
- Large PDFs (100+ pages) may take several minutes
- In-memory storage only (not persistent)
- Single language OCR (English)

## Troubleshooting

### OCR Not Working
- Ensure image quality is sufficient (>300 DPI recommended)
- Check browser console for Web Worker errors
- Verify Tesseract.js worker files are accessible

### PDF Rendering Issues
- Verify PDF is not corrupted or password-protected
- Check browser compatibility with PDF.js
- Ensure sufficient memory for large PDFs

### Backend Connection Errors
- Verify backend is running on port 8000
- Check CORS configuration in `app/main.py`
- Confirm `VITE_API_BASE_URL` in frontend `.env`

## Testing Scenarios

The integration tests cover realistic scenarios for medical/anatomy education:

1. **Single anatomy diagram**: High-resolution medical images with detailed labels
2. **Multi-page textbook**: Medical textbooks with 5-50+ pages
3. **Large posters**: 4K/8K resolution anatomy posters with 100+ labels
4. **Special characters**: Medical symbols (°, ², ♂, ♀, ⚕, etc.)
5. **Mixed quality**: Documents with varying scan quality per page
6. **Edge cases**: Low confidence scores, empty pages, blank images

## License

MIT License - See LICENSE file for details
