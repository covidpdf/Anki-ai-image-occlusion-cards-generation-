# Project Architecture

## Overview

This is a **monorepo** containing both frontend and backend for **Anki Decks Pro**, a lightweight flashcard creation tool with manual image occlusion editing. The monorepo structure allows for:

- Shared configuration and tooling
- Unified version control
- Coordinated testing and deployment
- Single source of truth for documentation

## Product Philosophy

Anki Decks Pro is an **MVP-focused** product built on these principles:
1. **Manual over Automatic**: User-driven occlusion editing, no AI/ML complexity
2. **Client-Side First**: Minimize server dependencies and infrastructure
3. **Keyboard Efficiency**: Fast workflows with shortcuts for power users
4. **Quality Gates**: Every feature must pass strict linting, type checks, and tests

## Project Structure

```
anki-decks-pro/
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── components/            # Reusable React components
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API clients and utilities
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/                    # Static assets
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── .eslintrc.cjs
│   ├── prettier.config.cjs
│   ├── .env.example
│   └── .gitignore
│
├── backend/                        # FastAPI REST API
│   ├── app/
│   │   ├── api/                   # API route handlers
│   │   │   ├── health.py          # Health check endpoints
│   │   │   └── __init__.py
│   │   ├── models/                # SQLAlchemy/Pydantic models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/              # Business logic
│   │   ├── main.py                # FastAPI app initialization
│   │   └── __init__.py
│   ├── tests/
│   │   ├── test_health.py
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── .env.example
│   └── README.md
│
├── docs/                          # Project documentation
│   ├── ARCHITECTURE.md            # This file
│   └── DEVELOPMENT.md             # Development guidelines
│
├── .github/                       # GitHub specific files
│   └── workflows/
│       ├── frontend-ci.yml        # Frontend CI pipeline
│       └── backend-ci.yml         # Backend CI pipeline
│
├── .editorconfig                  # Editor configuration
├── .gitignore                     # Git ignore patterns
├── .pre-commit-config.yaml        # Pre-commit hooks
├── README.md                      # Main documentation
└── LICENSE                        # License file
```

## Technology Stack

### Frontend

#### Core Framework
- **React 18**: Modern UI library with hooks and concurrent features
- **Vite**: Next-generation build tool with HMR and optimized bundling
- **TypeScript**: Type-safe JavaScript development

#### Tooling
- **pnpm**: Fast, disk-efficient package manager
- **ESLint**: Static analysis tool for JavaScript/TypeScript
- **Prettier**: Code formatter ensuring consistent style
- **Vitest**: Unit testing framework

#### Development
- **Node.js 18+**: Runtime environment
- **npm/pnpm**: Package managers

### Backend

#### Core Framework
- **FastAPI**: Modern, fast async web framework
- **Uvicorn**: ASGI web server
- **Pydantic**: Data validation and settings management

#### Tooling
- **Python 3.11+**: Runtime environment
- **uv**: Fast Python package installer and resolver
- **Ruff**: Lightning-fast Python linter
- **Black**: Python code formatter
- **pytest**: Testing framework
- **pytest-asyncio**: Async testing support

### Shared Infrastructure

#### Version Control & CI/CD
- **Git**: Version control
- **GitHub Actions**: Continuous Integration/Deployment
- **pre-commit**: Git hooks framework

#### Configuration
- **EditorConfig**: Cross-editor configuration
- **Environment variables**: Configuration management via .env files

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Browser (User)                           │
│                                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                   Frontend (React + Vite)                   │
│                    (Port 5173 - Dev)                        │
│                    (Static - Production)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Components → Pages → Services → API Client        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             │ http://localhost:8000
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│               Backend (FastAPI + Uvicorn)                  │
│                    (Port 8000)                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Routes → Schemas → Services → Database/Models     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  - API Documentation: /docs (Swagger UI)                   │
│  - Alternative Docs: /redoc (ReDoc)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Communication Protocol

### REST API Design

The backend provides a RESTful API following standard HTTP conventions:

- **GET** `/api/resource`: List or retrieve resources
- **POST** `/api/resource`: Create new resource
- **PUT** `/api/resource/{id}`: Update entire resource
- **PATCH** `/api/resource/{id}`: Partial update
- **DELETE** `/api/resource/{id}`: Delete resource

### Response Format

All responses are JSON with consistent structure:

```json
{
  "data": {},
  "meta": {
    "status": "success",
    "message": "Operation completed successfully"
  }
}
```

Error responses:

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

## Development Workflow

### Local Development

1. **Setup Phase**:
   ```bash
   cd /path/to/project
   
   # Install frontend dependencies
   cd frontend && pnpm install
   
   # Install backend dependencies
   cd ../backend && uv pip install -r requirements.txt
   ```

2. **Development Phase**:
   - Terminal 1: `cd frontend && pnpm dev` (starts at http://localhost:5173)
   - Terminal 2: `cd backend && uv run uvicorn main:app --reload` (starts at http://localhost:8000)

3. **Code Quality**:
   - Frontend: `pnpm lint`, `pnpm format`
   - Backend: `uv run ruff check .`, `uv run black .`

4. **Testing**:
   - Frontend: `pnpm test`
   - Backend: `uv run pytest`

### Pre-Commit Hooks

Pre-commit hooks run automatically before commits:

1. **Trailing Whitespace**: Removes trailing whitespace
2. **End of File Fixer**: Ensures files end with newline
3. **YAML Validator**: Checks YAML syntax
4. **JSON Validator**: Checks JSON syntax
5. **Private Key Detector**: Prevents accidental key commits
6. **Ruff**: Python linter with auto-fix
7. **Ruff Format**: Python formatter
8. **ESLint**: JavaScript/TypeScript linter with auto-fix
9. **Prettier**: Code formatter

To run manually: `pre-commit run --all-files`

## CI/CD Pipeline

### GitHub Actions Workflows

#### Frontend CI (`frontend-ci.yml`)
- Triggered on: push/PR to main/develop, changes in `frontend/` directory
- Matrix: Node.js 18.x, 20.x
- Steps:
  1. Checkout code
  2. Setup pnpm and Node.js
  3. Install dependencies (frozen lockfile)
  4. Type checking (`pnpm type-check`)
  5. Linting (`pnpm lint`)
  6. Build (`pnpm build`)
  7. Tests (`pnpm test`)

#### Backend CI (`backend-ci.yml`)
- Triggered on: push/PR to main/develop, changes in `backend/` directory
- Matrix: Python 3.11, 3.12
- Steps:
  1. Checkout code
  2. Setup Python
  3. Install uv
  4. Install dependencies (`requirements.txt`)
  5. Linting with Ruff
  6. Format checking with Black
  7. Tests with pytest

### Deployment Strategy

- **Development**: Runs on each commit
- **Production**: Manual or automated based on tags
- **Staging**: Automated on develop branch pushes

## Code Quality Standards

### Frontend

- **Language**: TypeScript (strict mode)
- **Linting**: ESLint with recommended rules
- **Formatting**: Prettier (100-char line width, single quotes)
- **Testing**: Vitest with coverage reporting
- **Type Safety**: 100% TypeScript, strict null checks

### Backend

- **Language**: Python 3.11+
- **Linting**: Ruff with standard rules
- **Formatting**: Black (100-char line width)
- **Type Hints**: Full type annotations (checked with mypy)
- **Testing**: pytest with asyncio support
- **Coverage**: Target 80%+ coverage

### Shared

- **EditorConfig**: Enforced consistent indentation and line endings
- **Git Hooks**: Automated checks before commits
- **Documentation**: Markdown with examples

## Performance Considerations

### Frontend
- Code splitting via Vite
- Lazy loading of routes
- Asset optimization
- CSR (Client-Side Rendering) for SPA

### Backend
- Async/await for I/O operations
- Request validation with Pydantic
- CORS middleware configuration
- API documentation via OpenAPI

## Security Considerations

- CORS whitelist restricted to frontend URLs
- Environment variables for sensitive data
- Input validation with Pydantic
- Type safety with Python type hints
- Dependency scanning via GitHub

## Monitoring & Logging

### Frontend
- Console errors and warnings
- Performance metrics (Vite build time)
- API request/response logging

### Backend
- Application logging (configurable level)
- Request/response timing
- Error tracking
- Health check endpoint

## Future Considerations

1. **Image Upload & Preview**: Client-side validation and preview rendering
2. **Batch Card Creation**: Generate multiple occlusion templates per image
3. **Deck Metadata**: Capture tags, notes, and scheduling hints
4. **Template Exporters**: Direct `.apkg` or text export for Anki import
5. **Collaboration Hooks**: Shared templates via lightweight backend endpoints
6. **Accessibility Enhancements**: High-contrast themes and keyboard-first UX polishing
7. **Offline Support**: Local storage persistence and sync primitives
8. **Deployment Packaging**: Docker images and lightweight PaaS deployment scripts

## Reference

- [Frontend Setup](../frontend/README.md)
- [Backend Setup](../backend/README.md)
- [Main README](../README.md)
