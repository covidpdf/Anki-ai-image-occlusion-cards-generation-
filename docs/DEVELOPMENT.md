# Development Guide

## Getting Started

Welcome to **Anki Decks Pro** development! This guide covers the complete workflow for contributing to this lightweight flashcard creation tool.

### Prerequisites

- Node.js v18+ ([download](https://nodejs.org/))
- pnpm v8+ (`npm install -g pnpm`)
- Python 3.11+ ([download](https://www.python.org/))
- uv (`pip install uv`)
- Git v2.x+ ([download](https://git-scm.com/))

### Initial Setup

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd anki-decks-pro
   ```

2. **Install pre-commit hooks**:
   ```bash
   pre-commit install
   ```

3. **Setup frontend**:
   ```bash
   cd frontend
   pnpm install
   cd ..
   ```

4. **Setup backend**:
   ```bash
   cd backend
   uv pip install -r requirements.txt
   cd ..
   ```

### Running Locally

Open three terminal windows:

**Terminal 1 - Frontend Dev Server**:
```bash
cd frontend
pnpm dev
```
Accessible at: http://localhost:5173

**Terminal 2 - Backend Dev Server**:
```bash
cd backend
uv run uvicorn app.main:app --reload
```
Accessible at: http://localhost:8000

**Terminal 3 - Git operations**:
```bash
# Create and checkout feature branch
git checkout -b feature/your-feature-name
```

## Frontend Development

### Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API clients and utilities
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── .eslintrc.cjs       # ESLint configuration
└── prettier.config.cjs # Prettier configuration
```

### Common Tasks

#### Add a new component
```bash
cd frontend/src/components
# Create MyComponent.tsx with TypeScript and JSX
```

Example component structure:
```tsx
import { FC } from 'react'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  )
}

export default MyComponent
```

#### Add a new page
```bash
cd frontend/src/pages
# Create NewPage.tsx
```

#### Create an API service
```bash
cd frontend/src/services
# Create apiClient.ts
```

Example API client:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`)
  return response.json()
}
```

### Type Safety

Always define types for your components and functions:

```tsx
// Good
interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

const Button: FC<ButtonProps> = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

// Avoid
const Button = ({ onClick, disabled, children }) => (...)
```

### Styling

Use inline CSS or CSS modules. Keep styles colocated with components:

```tsx
// MyComponent.tsx
import styles from './MyComponent.module.css'

const MyComponent = () => <div className={styles.container}>...</div>

// MyComponent.module.css
.container {
  padding: 1rem;
  background-color: #f5f5f5;
}
```

### Linting & Formatting

```bash
cd frontend

# Check for issues
pnpm lint

# Fix issues (auto-fixable)
pnpm lint --fix

# Format code
pnpm format

# Type check
pnpm type-check
```

### Testing

```bash
cd frontend

# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

Example test:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## Backend Development

### Project Structure
```
backend/
├── app/
│   ├── api/            # API route handlers
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── main.py         # FastAPI app
│   └── __init__.py
├── tests/              # Test files
├── requirements.txt    # Dependencies
└── pyproject.toml      # Project metadata
```

### Common Tasks

#### Add a new API endpoint

1. Create a router in `app/api/`:
```python
# app/api/items.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/items", tags=["items"])

@router.get("/")
async def list_items():
    return {"items": []}

@router.post("/")
async def create_item(name: str):
    return {"id": 1, "name": name}
```

2. Include in main app:
```python
# app/main.py
from app.api import items
app.include_router(items.router)
```

#### Add Pydantic schemas

```python
# app/schemas/item.py
from pydantic import BaseModel, Field

class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

class Item(ItemCreate):
    id: int

    class Config:
        from_attributes = True
```

#### Add database models

```python
# app/models/item.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
```

#### Create service layer

```python
# app/services/item_service.py
from app.models.item import Item
from app.schemas.item import ItemCreate

class ItemService:
    @staticmethod
    async def create_item(db, item: ItemCreate) -> Item:
        db_item = Item(name=item.name, description=item.description)
        db.add(db_item)
        db.commit()
        return db_item
```

### Type Hints

Always use type hints:

```python
# Good
async def create_item(name: str, db: Session) -> Item:
    item = Item(name=name)
    db.add(item)
    db.commit()
    return item

# Avoid
async def create_item(name, db):
    ...
```

### Async/Await

Use async for I/O operations:

```python
# Good
async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()

# Avoid
def fetch_data():
    response = requests.get("https://api.example.com/data")
    return response.json()
```

### Linting & Formatting

```bash
cd backend

# Check with Ruff
uv run ruff check .

# Fix issues
uv run ruff check --fix .

# Format with Black
uv run black .

# Check formatting
uv run black --check .

# Type check (if mypy installed)
uv run mypy .
```

### Testing

```bash
cd backend

# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_health.py

# Run with verbose output
uv run pytest -v

# Run with coverage
uv run pytest --cov=app
```

Example test:
```python
# tests/test_items.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_create_item():
    response = client.post("/api/items/", json={"name": "Test Item"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test Item"
```

## Git Workflow

### Creating a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/descriptive-name

# Make changes, commit with clear messages
git add .
git commit -m "feat: add user authentication"
git push origin feature/descriptive-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build, dependencies, etc

**Examples**:
```
feat(auth): add JWT authentication
fix(api): handle concurrent requests properly
docs(readme): update setup instructions
test(health): add health check tests
```

### Pre-Commit Hooks

Pre-commit hooks run automatically before each commit. They:

1. Fix trailing whitespace
2. Check YAML/JSON syntax
3. Run Ruff (Python linting)
4. Run Black (Python formatting)
5. Run ESLint (JavaScript/TypeScript)
6. Run Prettier (code formatting)

If hooks fail:
```bash
# Fix issues manually or let hooks auto-fix
git add .
git commit -m "your message" # Retry
```

To run manually:
```bash
pre-commit run --all-files
```

To skip (not recommended):
```bash
git commit --no-verify
```

## Code Review Checklist

Before submitting a pull request, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass locally (`pnpm test` / `uv run pytest`)
- [ ] No console errors or warnings
- [ ] Types are properly defined (TypeScript/Python)
- [ ] Documentation is updated if needed
- [ ] Pre-commit hooks pass
- [ ] Commit messages follow convention
- [ ] No secrets or credentials in code
- [ ] No large files or breaking changes

## Debugging

### Frontend

Use React DevTools and browser DevTools:
```bash
# Install React DevTools
# Available in Chrome/Firefox extension stores
```

In code:
```tsx
// Add console logs
console.log('value:', value)

// Use debugger statement
debugger; // Pauses execution if DevTools open
```

### Backend

Use Python debugger:
```python
# Add breakpoint
breakpoint()  # Python 3.7+

# Or use pdb
import pdb; pdb.set_trace()

# In tests
pytest --pdb
```

## Environment Variables

### Frontend
```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_LOG_LEVEL=debug
```

### Backend
```bash
# backend/.env
DATABASE_URL=sqlite:///./test.db
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:5173"]
```

## Performance Tips

### Frontend
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Optimize images (use webp, correct sizes)
- Monitor bundle size with `pnpm build`

### Backend
- Use database indexes for queries
- Implement caching for frequently accessed data
- Use async endpoints for I/O operations
- Monitor with FastAPI performance metrics

## Troubleshooting

### Port Already in Use
```bash
# Frontend (find and kill process on 5173)
lsof -i :5173
kill -9 <PID>

# Backend (find and kill process on 8000)
lsof -i :8000
kill -9 <PID>
```

### Dependencies Issues
```bash
# Frontend
rm -rf frontend/node_modules frontend/pnpm-lock.yaml
cd frontend && pnpm install

# Backend
cd backend && uv pip install --force-reinstall -r requirements.txt
```

### Git Hook Issues
```bash
# Reinstall hooks
pre-commit install --install-hooks

# Update hooks
pre-commit autoupdate
```

## Additional Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pydantic Docs](https://docs.pydantic.dev)
- [pytest Docs](https://docs.pytest.org)
