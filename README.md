# Anki AI Image Occlusion Cards Generation

A full-stack application for automatically generating Anki flashcard images with AI-powered occlusion. This project combines a modern React + Vite frontend with a FastAPI backend.

## ✨ Features

- **📄 PDF & Image Upload**: Drag-and-drop interface for uploading PDFs and images
- **🔍 OCR Processing**: Automatic text extraction using Tesseract.js with Web Worker support
- **📊 Visual Feedback**: Bounding box highlighting for recognized text
- **✏️ Manual Editing**: Review and edit extracted text before submission
- **🎯 Multi-page Support**: Process entire PDF documents with multiple pages
- **🧪 Comprehensive Testing**: Integration tests for medical textbooks and anatomy images

## Project Architecture

This is a **monorepo** containing both frontend and backend codebases:

```
.
├── frontend/          # React + Vite SPA
├── backend/           # FastAPI REST API
├── docs/              # Documentation
└── [root config]      # Shared tooling & CI/CD
```

## Tech Stack

### Frontend
- **React 18**: UI framework
- **Vite**: Next-generation build tool
- **TypeScript**: Type-safe JavaScript
- **pdf.js**: PDF rendering and page extraction
- **Tesseract.js**: OCR processing in Web Workers
- **ESLint + Prettier**: Code quality and formatting
- **pnpm**: Fast, efficient package manager

### Backend
- **FastAPI**: Modern async Python web framework
- **Python 3.11+**: Language runtime
- **Ruff + Black**: Python linting and formatting
- **pytest**: Testing framework
- **uv**: Fast Python package installer

### Shared Infrastructure
- **Git Hooks (pre-commit)**: Automated checks before commits
- **EditorConfig**: Consistent editor settings
- **GitHub Actions**: CI/CD pipeline

## Local Development Setup

### Prerequisites
- **Node.js**: v18+ (for frontend)
- **pnpm**: v8+ (`npm install -g pnpm`)
- **Python**: 3.11+ (for backend)
- **uv**: Fast Python package manager (`pip install uv`)
- **Git**: v2.x+

### Initial Setup

1. Clone the repository and install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   pnpm install
   
   # Install backend dependencies
   cd ../backend
   uv pip install -r requirements.txt
   ```

2. Set up pre-commit hooks:
   ```bash
   cd ..
   pre-commit install
   ```

3. Create environment files (if needed):
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env

   # Backend
   cp backend/.env.example backend/.env
   ```

### Running the Application

**Terminal 1 - Frontend Dev Server:**
```bash
cd frontend
pnpm dev
```

The app will be available at `http://localhost:5173`

**Terminal 2 - Backend Development Server:**
```bash
cd backend
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs` (Swagger UI)

## Code Quality & Linting

### Frontend (JavaScript/TypeScript)
```bash
cd frontend

# Run ESLint
pnpm lint

# Fix issues with Prettier
pnpm format

# Type checking
pnpm type-check
```

### Backend (Python)
```bash
cd backend

# Run Ruff linter
uv run ruff check .

# Format with Black
uv run black .

# Run tests
uv run pytest
```

### Pre-Commit Hooks

All lint/format checks run automatically before commits via pre-commit hooks. To run manually:
```bash
pre-commit run --all-files
```

## Testing

### Frontend
```bash
cd frontend
pnpm test
```

### Backend
```bash
cd backend
uv run pytest
```

## CI/CD Pipeline

The project includes GitHub Actions workflows that:
- Run linting checks on every push and pull request
- Run test suites for both frontend and backend
- Ensure code quality standards are maintained

See `.github/workflows/` for workflow definitions.

## Environment Variables

Create `.env` files for local development (see `.env.example` in each directory):

**frontend/.env:**
```
VITE_API_URL=http://localhost:8000
```

**backend/.env:**
```
DATABASE_URL=sqlite:///./test.db
LOG_LEVEL=INFO
```

## Project Structure

### Frontend
```
frontend/
├── src/
│   ├── components/    # Reusable React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API clients and utilities
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx
│   └── main.tsx
├── public/            # Static assets
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
└── prettier.config.cjs
```

### Backend
```
backend/
├── app/
│   ├── api/           # API routes
│   ├── models/        # Data models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── main.py
├── tests/
│   └── test_*.py
├── requirements.txt
└── pyproject.toml
```

## Configuration Files

- **`.editorconfig`**: Consistent editor settings across IDEs
- **`.gitignore`**: Git ignore patterns for both stacks
- **`.pre-commit-config.yaml`**: Pre-commit hook configuration
- **`pyproject.toml`**: Python project metadata and tool config
- **`vite.config.ts`**: Vite build configuration
- **`tsconfig.json`**: TypeScript configuration
- **`.eslintrc.cjs`**: ESLint configuration
- **`prettier.config.cjs`**: Prettier formatting rules
- **`ruff.toml`**: Ruff linter configuration
- **`pyproject.toml`**: Black formatter and pytest configuration

## Troubleshooting

### Frontend Port Already in Use
```bash
# Specify a different port
cd frontend
pnpm dev -- --port 5174
```

### Backend Port Already in Use
```bash
# Specify a different port
cd backend
uv run uvicorn main:app --reload --port 8001
```

### Pre-Commit Hooks Failing
```bash
# See what's failing
pre-commit run --all-files

# Run linting/formatting manually and retry
cd frontend && pnpm lint && pnpm format
cd ../backend && uv run ruff check --fix . && uv run black .
```

### Poetry Lock Issues
```bash
cd backend
uv pip install --compile-bytecode -r requirements.txt
```

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [OCR Upload Flow](docs/OCR_UPLOAD_FLOW.md)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and ensure all checks pass: `pre-commit run --all-files`
3. Commit your changes: `git commit -m "feat: your feature description"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

See LICENSE file for details.
