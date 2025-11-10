# Frontend - React + Vite Application

This is the frontend for the Anki Image Occlusion Cards Generation application, built with React 18 and Vite.

## Quick Start

### Prerequisites

- Node.js v18+
- pnpm v8+ (recommended) or npm/yarn

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install
```

### Running the Development Server

```bash
# Start the dev server
pnpm dev

# Server will be available at http://localhost:5173
```

The browser will automatically open and hot module replacement (HMR) will reload changes instantly.

## Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Type checking
pnpm type-check

# Linting
pnpm lint

# Fix linting issues
pnpm lint --fix

# Format code
pnpm format

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── [Component]/
│   │       ├── index.tsx
│   │       └── [Component].css
│   ├── pages/             # Page-level components
│   │   └── [PageName]/
│   │       └── [PageName].tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useCustomHook.ts
│   ├── services/          # API clients and utilities
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Root component
│   ├── App.css
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
│   └── favicon.svg
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Node files
├── .eslintrc.cjs          # ESLint configuration
├── prettier.config.cjs    # Prettier configuration
├── package.json
├── pnpm-lock.yaml         # Locked dependency versions
└── README.md              # This file
```

## Component Guidelines

### Creating a Component

```tsx
// src/components/Button/Button.tsx
import { FC, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({ onClick, disabled = false, variant = 'primary', children }) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
```

### Exporting from Components

Create `src/components/index.ts` for easy imports:

```typescript
export { default as Button } from './Button';
export { default as Card } from './Card';
// ... more exports
```

Then import like:

```typescript
import { Button, Card } from '@/components';
```

## Styling

### CSS Modules (Recommended)

```tsx
import styles from './MyComponent.module.css';

export default function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

```css
/* MyComponent.module.css */
.container {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.container:hover {
  background-color: #e8e8e8;
}
```

### Global Styles

Add to `src/index.css`:

```css
/* Global variables */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 0.5rem;
}

/* Global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

## Type Safety

### Define Props Interfaces

```tsx
interface MyComponentProps {
  title: string;
  count: number;
  onClick?: () => void;
  data?: Record<string, unknown>;
}

const MyComponent: FC<MyComponentProps> = ({ title, count, onClick, data }) => {
  // ...
};
```

### Type Definitions

Create `src/types/index.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Card {
  id: string;
  front: string;
  back: string;
  userId: string;
}
```

## API Integration

### Creating an API Service

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function createCard(data: CardData) {
  const response = await fetch(`${API_URL}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create card');
  return response.json();
}
```

### Using in Components

```tsx
import { useEffect, useState } from 'react';
import { fetchHealth } from '@/services/api';

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {status && <p>Status: {status}</p>}
    </div>
  );
}
```

## Hooks

### Custom Hooks

```typescript
// src/hooks/useFetch.ts
import { useEffect, useState } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

Usage:

```tsx
const { data, loading, error } = useFetch('/api/cards');
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run specific file
pnpm test -- MyComponent.test.tsx

# Generate coverage
pnpm test:coverage
```

### Writing Tests

```tsx
// src/components/Button/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button onClick={vi.fn()}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Button onClick={vi.fn()} disabled>
        Click me
      </Button>
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Code Quality

### Linting

ESLint checks for code quality issues:

```bash
# Check code
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

Configuration in `.eslintrc.cjs`:

- React hooks rules
- TypeScript type checking
- Prettier integration

### Formatting

Prettier ensures consistent code style:

```bash
# Format all files
pnpm format
```

Configuration in `prettier.config.cjs`:

- 100 character line width
- Single quotes
- No trailing commas in TypeScript

### Type Checking

TypeScript provides compile-time type safety:

```bash
# Type check without building
pnpm type-check

# Build includes type checking
pnpm build
```

## Environment Variables

### Creating .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Using in Code

```typescript
// Vite exposes env vars prefixed with VITE_
const apiUrl = import.meta.env.VITE_API_URL;

// Add types
declare interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LOG_LEVEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Build

### Development Build

```bash
pnpm dev
```

### Production Build

```bash
# Create optimized build
pnpm build

# Build outputs to dist/ directory
# Tree-shaken, minified, code-split
```

### Preview Production Build

```bash
# Build and serve locally
pnpm preview

# Available at http://localhost:4173
```

## Vite Configuration

See `vite.config.ts` for configuration:

- React plugin with fast refresh
- TypeScript support
- CSS modules
- Asset optimization
- Dev server configuration

## Performance

### Code Splitting

Vite automatically splits code. For manual splitting:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Image Optimization

```tsx
// Use optimized formats
<img src="/images/photo.webp" alt="description" />;

// Or use dynamic imports
import heroImage from '/images/hero.jpg';
```

### Build Analysis

```bash
# View bundle size
pnpm build
```

## Troubleshooting

### Port Already in Use

```bash
# Use different port
pnpm dev -- --port 5174
```

### Module Not Found

```bash
# Check paths in vite.config.ts and tsconfig.json
# Ensure @ alias points to src/
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### HMR Issues

```bash
# Full page reload if HMR fails
# Check browser console for errors
# Try clearing browser cache (Ctrl+Shift+R or Cmd+Shift+R)
```

### Type Errors After Dependency Update

```bash
# Reinstall and regenerate types
pnpm install
pnpm type-check
```

## Best Practices

1. **Use TypeScript strict mode** - Catch errors early
2. **Lift state up** - Keep state close to where it's used
3. **Memoize expensive computations** - Use useMemo/useCallback
4. **Keep components small** - Single responsibility principle
5. **Extract custom hooks** - Reuse stateful logic
6. **Use CSS modules** - Avoid global style conflicts
7. **Test components** - Write unit and integration tests
8. **Document components** - JSDoc comments for public APIs

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
