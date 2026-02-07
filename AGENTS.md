# AGENTS.md

This document provides guidelines for AI agents working in this repository.

## Project Overview

Tasky is a monorepo with a React/Vite frontend (TypeScript, Tailwind CSS, React Query) and a Spring Boot backend (Java 25, PostgreSQL, JWT). Managed with pnpm.

## Turborepo using Build Commands

### Frontend (tasky-frontend)

```bash
# Root workspace commands
pnpm install                    # Install dependencies
pnpm dev                        # Start development servers
pnpm build                      # Build all packages
pnpm lint                       # Lint all packages
pnpm test                       # Run all tests

# Single package commands
cd tasky-frontend/apps/web && pnpm dev
cd tasky-frontend/apps/web && pnpm build
cd tasky-frontend/apps/web && pnpm lint
cd tasky-frontend/apps/web && pnpm test
pnpm test -- --run              # Run single test file (vitest)
```

### Backend (tasky-backend)

```bash
cd tasky-backend
./mvnw clean compile           # Compile
./mvnw test                    # Run tests
./mvnw spring-boot:run         # Start server
./mvnw package                 # Build JAR
```

### Docker

```bash
docker-compose up --build       # Start all services
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with explicit types for function parameters and return types
- Use `readonly` for component props
- Use absolute imports with `@/` alias (configured in `tsconfig.json`)
- Prefer interfaces over type aliases for object shapes
- Use `type` keyword for unions, intersections, and primitives

```typescript
interface ComponentProps {
  readonly title: string
  readonly onClick: () => void
}

export function Component({ title, onClick }: ComponentProps) {
  // ...
}
```

### Imports

- Organize imports in three groups: external libraries, internal workspace packages, local relative imports
- Use named imports for React hooks and utilities
- Alphabetize imports within each group

```typescript
import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent } from '@tasky/ui'
import { queryClient } from '@/lib/query-client'
import styles from './component.module.css'
```

### Components

- Use function components with explicit prop interfaces
- Use named exports for all components
- Keep components focused and small
- Use composition over prop drilling

```typescript
interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'destructive'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  // ...
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard`, `AuthProvider`)
- **Files**: kebab-case for components (e.g., `task-card.tsx`), camelCase for utilities
- **Variables/functions**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces**: PascalCase with Props suffix for component props

### React Patterns

- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Use `useEffect` with proper cleanup
- Prefer controlled components
- Use React Query for data fetching with proper invalidation

```typescript
const queryClient = useQueryClient()

const { data, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
})

const mutation = useMutation({
  mutationFn: createTask,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
})
```

### Error Handling

- Return error objects from async functions: `{ error: Error | null }`
- Handle errors gracefully with user feedback via toast
- Log errors appropriately in development

```typescript
async function login(username: string, password: string): Promise<{ error: Error | null }> {
  try {
    await authService.login(username, password)
    return { error: null }
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Login failed')
    console.error(error)
    return { error }
  }
}
```

### CSS/Styling

- Use Tailwind CSS with utility classes
- Use `cn()` utility from `@tasky/ui/lib/utils` for conditional classes
- Follow consistent spacing scale
- Use semantic color names (e.g., `text-muted-foreground`, `bg-destructive`)

```typescript
import { cn } from '@tasky/ui/lib/utils'

<div className={cn('flex gap-4', isActive && 'bg-primary')}>
```

### Backend (Java)

- Use Lombok for boilerplate reduction
- Follow Spring Boot conventions
- Use proper exception handling with `@ControllerAdvice`
- Use JPA repositories with custom queries as needed
- Follow RESTful URL design

### Testing

- Use Vitest for frontend with React Testing Library
- Place tests adjacent to source files (`*.test.tsx`)
- Mock external dependencies
- Test component behavior, not implementation details

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

test('renders task card with title', () => {
  render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
  expect(screen.getByText(mockTask.title)).toBeInTheDocument()
})
```

## Project Structure

```
tasky-app/
├── tasky-frontend/
│   ├── apps/web/          # Main React app
│   ├── packages/
│   │   ├── ui/            # Shared UI components
│   │   └── services/       # API client & hooks
│   └── package.json       # pnpm workspace
├── tasky-backend/         # Spring Boot API
│   ├── src/main/java/
│   └── pom.xml
├── docker-compose.yml
└── AGENTS.md
```

## Environment Variables

Frontend: `VITE_API_URL` - Backend API URL

Backend: Configure via `.env` or environment variables (uses Spring Dotenv)

## Common Tasks

- **Add new page**: Create in `apps/web/src/pages/`, add route in `app.tsx`
- **Add shared UI component**: Create in `packages/ui/src/`, export from `index.ts`
- **Add API hook**: Create in `packages/services/src/`
- **Add backend endpoint**: Create controller in `tasky-backend/src/main/java/`
