# API Documentation

## Overview

The Anki Image Occlusion API provides endpoints for managing PDF submissions, generating flashcards with AI-powered occlusions, and exporting Anki-compatible decks.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-backend-url.com`

## Authentication

Currently, the API does not require authentication. This will be implemented in future versions using JWT or OAuth2.

## Response Format

All responses follow a consistent JSON structure:

### Success Response

```json
{
  "data": {},
  "meta": {
    "status": "success",
    "message": "Operation completed successfully"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "meta": {
    "status": "error",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Endpoints

### Health Check

#### Get Health Status
```
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Submissions

#### Create Submission (Upload PDF)
```
POST /api/submissions
Content-Type: multipart/form-data
```

**Request:**
- `file` (required): PDF file to upload

**Example:**
```bash
curl -X POST http://localhost:8000/api/submissions \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "status": "uploaded",
  "cards": [],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Status Codes:**
- `201 Created`: Submission created successfully
- `400 Bad Request`: Invalid file
- `413 Payload Too Large`: File exceeds size limit

---

#### Get Submission
```
GET /api/submissions/{submission_id}
```

**Parameters:**
- `submission_id` (path, required): UUID of the submission

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "status": "generated",
  "cards": [
    {
      "id": "card-001",
      "image_url": "/api/submissions/550e8400-e29b-41d4-a716-446655440000/image",
      "occlusions": [
        {
          "id": "occ-001",
          "type": "rectangle",
          "coordinates": [10, 20, 100, 50],
          "text": "term"
        }
      ],
      "front_text": "Question 1",
      "back_text": "Answer 1",
      "approved": false
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Submission found
- `404 Not Found`: Submission not found

---

#### Generate Cards
```
POST /api/submissions/{submission_id}/generate
```

**Parameters:**
- `submission_id` (path, required): UUID of the submission

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "status": "generated",
  "cards": [
    {
      "id": "card-001",
      "image_url": "/api/submissions/550e8400-e29b-41d4-a716-446655440000/image",
      "occlusions": [
        {
          "id": "occ-001",
          "type": "rectangle",
          "coordinates": [10, 20, 100, 50],
          "text": "term_1"
        }
      ],
      "front_text": "Question 1",
      "back_text": "Answer 1",
      "approved": false
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Cards generated successfully
- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Generation failed

---

#### Approve Submission
```
PATCH /api/submissions/{submission_id}/approve
Content-Type: application/json
```

**Parameters:**
- `submission_id` (path, required): UUID of the submission

**Request Body:**
```json
{
  "cards": [
    {
      "id": "card-001",
      "image_url": "/api/submissions/550e8400-e29b-41d4-a716-446655440000/image",
      "occlusions": [
        {
          "id": "occ-001",
          "type": "rectangle",
          "coordinates": [10, 20, 100, 50],
          "text": "term_1"
        }
      ],
      "front_text": "Updated Question",
      "back_text": "Updated Answer",
      "approved": true
    }
  ],
  "notes": "Optional approval notes"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "status": "approved",
  "cards": [
    {
      "id": "card-001",
      "image_url": "/api/submissions/550e8400-e29b-41d4-a716-446655440000/image",
      "occlusions": [
        {
          "id": "occ-001",
          "type": "rectangle",
          "coordinates": [10, 20, 100, 50],
          "text": "term_1"
        }
      ],
      "front_text": "Updated Question",
      "back_text": "Updated Answer",
      "approved": true
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Status Codes:**
- `200 OK`: Cards approved successfully
- `404 Not Found`: Submission not found
- `400 Bad Request`: Invalid card data

---

#### Export Submission
```
POST /api/submissions/{submission_id}/export
```

**Parameters:**
- `submission_id` (path, required): UUID of the submission

**Response:**
```json
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "download_url": "/api/submissions/550e8400-e29b-41d4-a716-446655440000/download",
  "filename": "deck_550e8400-e29b-41d4-a716-446655440000.apkg"
}
```

**Status Codes:**
- `200 OK`: Export created successfully
- `404 Not Found`: Submission not found
- `500 Internal Server Error`: Export generation failed

---

#### Download Submission
```
GET /api/submissions/{submission_id}/download
```

**Parameters:**
- `submission_id` (path, required): UUID of the submission

**Response:**
```json
{
  "status": "success",
  "data": "UEsDBAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLAQIUAAoAAAAAAIRrT1YAAAAAAAAAAAAAAAAJABAAZ2Vuc3RhZWQvAFBLBQY=",
  "filename": "deck_550e8400-e29b-41d4-a716-446655440000.apkg"
}
```

**Status Codes:**
- `200 OK`: File ready for download
- `404 Not Found`: Submission not found

---

## Data Models

### Submission Status Enum
```typescript
enum SubmissionStatus {
  UPLOADED = "uploaded",
  PROCESSING = "processing",
  GENERATED = "generated",
  APPROVED = "approved",
  EXPORTED = "exported"
}
```

### Occlusion Type Enum
```typescript
enum OcclusionType {
  RECTANGLE = "rectangle",
  ELLIPSE = "ellipse",
  POLYGON = "polygon"
}
```

### Card Schema
```typescript
interface Card {
  id?: string;
  image_url: string;
  occlusions: Occlusion[];
  front_text: string;
  back_text: string;
  approved: boolean;
}
```

### Occlusion Schema
```typescript
interface Occlusion {
  id?: string;
  type: OcclusionType;
  coordinates: number[]; // [x, y, width, height]
  text?: string;
}
```

### Submission Schema
```typescript
interface Submission {
  id: string;
  filename: string;
  status: SubmissionStatus;
  cards: Card[];
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_FILE` | 400 | File format not supported or missing |
| `FILE_TOO_LARGE` | 413 | File exceeds maximum size limit |
| `SUBMISSION_NOT_FOUND` | 404 | Submission with given ID not found |
| `INVALID_CARD_DATA` | 400 | Card data structure is invalid |
| `GENERATION_FAILED` | 500 | AI/OCR generation encountered an error |
| `EXPORT_FAILED` | 500 | Deck export generation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

Current rate limits (per minute):
- **Uploads**: 10 requests
- **Generate**: 5 requests
- **Export**: 3 requests

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
```

---

## CORS

The API accepts requests from:
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://your-frontend-domain.vercel.app` (production)

---

## Example Workflow

### 1. Upload PDF
```bash
curl -X POST http://localhost:8000/api/submissions \
  -F "file=@biology.pdf"
```

### 2. Generate Cards
```bash
curl -X POST http://localhost:8000/api/submissions/{id}/generate
```

### 3. Approve Cards
```bash
curl -X PATCH http://localhost:8000/api/submissions/{id}/approve \
  -H "Content-Type: application/json" \
  -d '{"cards": [...], "notes": "Approved"}'
```

### 4. Export Deck
```bash
curl -X POST http://localhost:8000/api/submissions/{id}/export
```

### 5. Download
```bash
curl http://localhost:8000/api/submissions/{id}/download \
  -o deck.apkg
```

---

## Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These pages allow you to test endpoints directly from your browser.

---

## Performance Considerations

- File uploads limited to 50MB
- Card generation timeout: 30 seconds
- Concurrent submissions: Limited per user
- Database connection pool: 20 connections

---

## Versioning

Current API version: **v1**

Future versions will use `/api/v2/` prefix for breaking changes.

---

## Support

For API issues or questions:
1. Check interactive documentation at `/docs`
2. Review error message details
3. Check GitHub issues: [Link to repo]
4. Contact: support@example.com
