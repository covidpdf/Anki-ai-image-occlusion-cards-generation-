# MVP End-to-End Integration Guide

This document provides a comprehensive guide for running and testing the complete MVP workflow of the Anki Image Occlusion Cards Generation application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Complete Workflow](#complete-workflow)
3. [Testing](#testing)
4. [Troubleshooting](#troubleshooting)
5. [Deployment](#deployment)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- pnpm 8.15.4 or later
- uv (Python package manager)
- Git

### Setup (5 minutes)

```bash
# Clone the repository
git clone <repo-url>
cd anki-ai-image-occlusion-cards-generation

# Install pre-commit hooks
pre-commit install

# Frontend setup
cd frontend
pnpm install

# Backend setup
cd ../backend
uv pip install -r requirements.txt
```

### Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
pnpm dev
```
Access at: http://localhost:5173

**Terminal 2 - Backend:**
```bash
cd backend
uv run uvicorn app.main:app --reload
```
Access at: http://localhost:8000

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Complete Workflow

### Step 1: Upload PDF

1. Open http://localhost:5173 in your browser
2. Create a test PDF file (or use any existing PDF)
3. Upload the PDF using the upload interface
4. You should see:
   - File validated
   - Submission ID created
   - Status changes to "generated"

### Step 2: Generate Cards

1. Click the "Generate Cards" button
2. The system will:
   - Analyze the PDF (mock OCR in MVP)
   - Generate 3 sample flashcards with occlusions
   - Display cards with editable front/back text
3. You can see:
   - Card preview with image and occlusion overlay
   - Editable question and answer fields

### Step 3: Review & Approve Cards

1. Review each generated card
2. Edit card text if needed:
   - Front (Question) field
   - Back (Answer) field
3. Click "Approve & Continue"
4. Status updates to "approved"

### Step 4: Export Deck

1. Review export confirmation message
2. Click "Export to Anki"
3. System generates `.apkg` file
4. Status updates to "exported"

### Step 5: Download Deck

1. Click "Download Deck"
2. Browser downloads `deck_<id>.apkg` file
3. Import into Anki:
   - File → Import
   - Select the downloaded `.apkg` file
   - Cards appear in your Anki collection

## Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test App.test.tsx

# Generate coverage report
pnpm test -- --coverage
```

**Test Coverage:**
- E2E workflow tests
- Component rendering tests
- API client integration tests
- Error handling tests

### Backend Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/test_submissions.py

# Generate coverage report
uv run pytest --cov=app tests/
```

**Test Coverage:**
- Submission creation
- Card generation
- Approval workflow
- Export and download
- Error scenarios

### Manual Testing Checklist

#### Upload Step
- [ ] Upload PDF successfully
- [ ] Handle missing file error
- [ ] Handle invalid file type
- [ ] Drag-and-drop works
- [ ] Loading state displays

#### Generate Step
- [ ] Cards generate with correct structure
- [ ] Multiple cards created
- [ ] Error handling on generation failure
- [ ] Loading state displays
- [ ] Cancel option works

#### Review Step
- [ ] All cards display
- [ ] Can edit card text
- [ ] Occlusion overlay visible
- [ ] Front/back text editable
- [ ] Responsive layout

#### Export Step
- [ ] Export button functional
- [ ] Loading state displays
- [ ] Success message shows
- [ ] Error handling works

#### Download Step
- [ ] Download triggers browser download
- [ ] File is named correctly
- [ ] File is valid `.apkg`
- [ ] Can import into Anki

### API Testing

#### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Create submission
curl -X POST http://localhost:8000/api/submissions \
  -F "file=@document.pdf"

# Get submission
curl http://localhost:8000/api/submissions/{submission_id}

# Generate cards
curl -X POST http://localhost:8000/api/submissions/{submission_id}/generate

# Approve submission
curl -X PATCH http://localhost:8000/api/submissions/{submission_id}/approve \
  -H "Content-Type: application/json" \
  -d '{"cards": [...]}'

# Export
curl -X POST http://localhost:8000/api/submissions/{submission_id}/export

# Download
curl http://localhost:8000/api/submissions/{submission_id}/download
```

#### Using Swagger UI

1. Open http://localhost:8000/docs
2. Expand each endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"
6. View response

### Accessibility Testing

```bash
# Install accessibility testing tools locally
npm install -g axe-core
npm install -g pa11y

# Test with pa11y
pa11y http://localhost:5173

# Use browser DevTools
# 1. Open DevTools (F12)
# 2. Install axe DevTools extension
# 3. Run automated scan
```

**Manual Accessibility Checks:**
- [ ] Keyboard navigation works (Tab, Enter, Shift+Tab)
- [ ] Screen reader announces all content
- [ ] Color contrast is sufficient
- [ ] Focus visible on all interactive elements
- [ ] Responsive at 320px, 768px, 1920px widths
- [ ] Works without images
- [ ] Works without color
- [ ] Works without mouse

## Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```bash
cd frontend
pnpm dev -- --port 5174
```

**Module not found errors:**
```bash
cd frontend
pnpm install
pnpm type-check
```

**Build fails:**
```bash
cd frontend
pnpm lint --fix
pnpm format
pnpm build
```

**API calls return 404:**
- Check that backend is running: `curl http://localhost:8000/health`
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Backend Issues

**Port 8000 already in use:**
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8001
```

**Module import errors:**
```bash
cd backend
uv pip install -r requirements.txt
```

**Tests fail:**
```bash
cd backend
uv run pytest -v --tb=short

# Clear cache
rm -rf .pytest_cache __pycache__
uv run pytest
```

**CORS errors:**
- Verify frontend URL in `CORS_ORIGINS` in backend
- Check for typos in headers
- Ensure requests include proper Content-Type

### Database Issues

**SQLite lock error:**
```bash
cd backend
# Remove lock file
rm -f test.db-journal

# Restart backend
uv run uvicorn app.main:app --reload
```

**Data persistence:**
- Data is stored in-memory for MVP
- Restart backend clears all submissions
- For production, use PostgreSQL

## Code Quality

### Linting & Formatting

**Frontend:**
```bash
cd frontend
pnpm lint        # Check issues
pnpm lint --fix  # Fix automatically
pnpm format      # Format code
```

**Backend:**
```bash
cd backend
uv run ruff check .       # Check issues
uv run ruff check --fix . # Fix automatically
uv run black .            # Format code
```

### Type Checking

**Frontend:**
```bash
cd frontend
pnpm type-check
```

**Backend:**
```bash
cd backend
# Type hints verified by Ruff and Python runtime
uv run pytest --tb=short
```

### Pre-commit Hooks

```bash
# Run all hooks
pre-commit run --all-files

# Update hooks
pre-commit autoupdate

# Bypass hooks (not recommended)
git commit --no-verify
```

## CI/CD Pipeline

### GitHub Actions Workflows

**Frontend CI** (`.github/workflows/frontend-ci.yml`)
- Triggers on changes to `frontend/` directory
- Runs on Node 18.x and 20.x
- Steps: type-check → lint → build → test

**Backend CI** (`.github/workflows/backend-ci.yml`)
- Triggers on changes to `backend/` directory
- Runs on Python 3.11 and 3.12
- Steps: ruff check → black check → pytest

### Local CI Simulation

```bash
# Simulate frontend CI
cd frontend
pnpm type-check
pnpm lint
pnpm build
pnpm test

# Simulate backend CI
cd backend
uv run ruff check .
uv run black --check .
uv run pytest
```

## Deployment

### Pre-deployment Checklist

- [ ] All tests pass locally
- [ ] No type errors
- [ ] No linting issues
- [ ] Build succeeds
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database backup (if applicable)

### Frontend Deployment (Vercel)

```bash
cd frontend

# Build locally to verify
pnpm build

# Deploy to Vercel (requires Vercel CLI)
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-url.com
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed Vercel setup.

### Backend Deployment (Render/Fly.io)

```bash
cd backend

# Ensure all tests pass
uv run pytest

# Push to GitHub (triggers CI/CD)
git push origin main

# Render/Fly.io automatically deploys on successful tests
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed backend setup.

## Performance Monitoring

### Frontend

```bash
# Build analysis
cd frontend
pnpm build
pnpm preview

# Performance audit
npm install -g lighthouse
lighthouse http://localhost:5173
```

### Backend

```bash
cd backend

# Database query analysis
uv run pytest --durations=10

# Memory profiling
pip install memory-profiler
python -m memory_profiler app/main.py
```

## Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Accessibility**: [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)
- **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Useful Commands

```bash
# Reinstall all dependencies
rm -rf frontend/node_modules backend/.venv
cd frontend && pnpm install
cd ../backend && uv pip install -r requirements.txt

# Clean build artifacts
cd frontend && rm -rf dist .vite
cd ../backend && rm -rf build dist *.egg-info

# Reset database
cd backend && rm -f test.db

# View API documentation
open http://localhost:8000/docs

# Run full test suite
cd frontend && pnpm test
cd ../backend && uv run pytest

# Format all code
cd frontend && pnpm format
cd ../backend && uv run ruff check --fix . && uv run black .
```

## Support & Resources

### Documentation
- Frontend README: [frontend/README.md](frontend/README.md)
- Backend README: [backend/README.md](backend/README.md)
- Main README: [README.md](README.md)

### External Resources
- React Docs: https://react.dev
- FastAPI Docs: https://fastapi.tiangolo.com
- Vite Docs: https://vitejs.dev
- TypeScript Docs: https://www.typescriptlang.org

### Getting Help
1. Check error messages carefully
2. Review relevant documentation
3. Check GitHub issues
4. Search Stack Overflow
5. Ask team members

## Next Steps

After MVP approval, consider:

1. **Database Integration**: Add SQLAlchemy models and PostgreSQL
2. **Authentication**: Implement JWT or OAuth2
3. **Real OCR**: Integrate actual OCR library (Tesseract, AWS Textract)
4. **File Storage**: Add S3 or cloud storage integration
5. **Monitoring**: Add logging, error tracking, analytics
6. **Performance**: Add caching, optimize queries
7. **Security**: Add rate limiting, input validation, security headers
8. **UI/UX**: Polish design, add more animations, improve accessibility

## Version History

- **v0.1.0** (MVP): Basic workflow with mock implementation
  - File upload
  - Card generation (mock)
  - Card approval
  - Export to Anki
  - Download deck

---

**Last Updated**: 2024-01-01
**Status**: MVP Ready
**Maintainers**: Development Team
