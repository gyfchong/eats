# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TanStack-based React application using modern tooling and integrations. It's a full-stack application combining:

- **Frontend**: React 19 with TanStack Router (file-based routing), TanStack Query, and TanStack Form
- **Backend**: Convex (serverless backend)
- **Deployment**: Cloudflare Pages with authentication middleware
- **Styling**: Tailwind CSS v4 with Shadcn components (new-york style)
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions for automated deployment

The application is in early development with demo routes showcasing forms, data fetching, and Convex integration.

## Build and Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs Convex dev + Vite on port 3000 concurrently)
pnpm dev

# Build for production (includes TypeScript checking)
pnpm build

# Preview production build locally
pnpm preview

# Run tests
pnpm test

# Run tests for a specific file
pnpm test src/path/to/file.test.tsx

# Lint code
pnpm lint

# Format code
pnpm format

# Lint and format with auto-fix
pnpm check

# Initialize Convex (sets up environment variables)
npx convex init

# Deploy to Convex only
pnpm deploy:convex

# Deploy to Cloudflare Pages only
pnpm deploy:cloudflare

# Build and deploy to both Convex and Cloudflare
pnpm deploy
```

## Architecture

### Routing

Uses **TanStack Router v1** with file-based routing. Routes are defined as files in `src/routes/`:

- `src/routes/__root.tsx` - Root layout with Convex provider, Header, and devtools
- `src/routes/index.tsx` - Home route

Router is configured in `src/main.tsx` with auto code splitting enabled. The root route context provides the QueryClient to all child routes.

### Data Fetching

Integrated with **TanStack Query v5** for data fetching:

- QueryClient is created in `src/integrations/tanstack-query/root-provider.tsx`
- Convex queries use `@convex-dev/react-query` adapter for integration
- TanStack Router's loader API can be used as an alternative for route-specific data loading

**Recommended Pattern for Convex Integration:**

```tsx
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'

// For queries - use useSuspenseQuery with convexQuery
// The convexQueryClient is configured globally as the default queryFn
const { data: items } = useSuspenseQuery(
  convexQuery(api.collection.list, {
    paramName: paramValue,
  }),
)

// For mutations - use useConvexMutation
const createMutation = useConvexMutation(api.collection.create)
const updateMutation = useConvexMutation(api.collection.update)
const deleteMutation = useConvexMutation(api.collection.delete)
```

This pattern provides:

- Type-safe Convex integration with TanStack Query
- Automatic loading states via Suspense boundaries
- Reactive data updates pushed from server (no manual refetching needed)
- Optimistic updates and cache management
- No manual loading/undefined state handling needed

**How It Works:**
The QueryClient is configured (in `src/integrations/tanstack-query/root-provider.tsx`) with:
- `queryFn: convexQueryClient.queryFn()` - handles executing Convex queries
- `queryKeyHashFn: convexQueryClient.hashFn()` - handles query key hashing
- `staleTime: Infinity` - data is never stale because Convex pushes updates reactively

The `convexQueryClient.connect(queryClient)` call enables reactive subscriptions where query results automatically update when the server data changes

### Backend (Convex)

- Database schema defined in `convex/schema.ts` using Convex validators (`v` builder)
- Functions in `convex/todos.ts` expose query/mutation endpoints
- Generated types in `convex/_generated/` (don't edit)
- Provider wraps the app in `src/integrations/convex/provider.tsx` using ConvexQueryClient
- Requires `VITE_CONVEX_URL` environment variable

### UI Components

Shadcn components installed via:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are in `src/components/ui/`. Ready-to-use components include: button, input, select, textarea, switch, slider, label.

### Styling

- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Class utilities via `clsx` and `tailwind-merge`
- Global styles in `src/styles.css`

## Key Integrations

### Development Tools

All running in the root layout (`src/routes/__root.tsx`):

- **TanStack Devtools** (position: bottom-right) - unified devtools panel
- **TanStack Router Devtools** - route tree and navigation debugging
- **TanStack Query Devtools** - query state and cache inspection
- **TanStack React Devtools** - component state inspection

### Forms

---

id: overview
title: Overview

---

TanStack Form is the ultimate solution for handling forms in web applications, providing a powerful and flexible approach to form management. Designed with first-class TypeScript support, headless UI components, and a framework-agnostic design, it streamlines form handling and ensures a seamless experience across various front-end frameworks.

## Motivation

Most web frameworks do not offer a comprehensive solution for form handling, leaving developers to create their own custom implementations or rely on less-capable libraries. This often results in a lack of consistency, poor performance, and increased development time. TanStack Form aims to address these challenges by providing an all-in-one solution for managing forms that is both powerful and easy to use.

With TanStack Form, developers can tackle common form-related challenges such as:

- Reactive data binding and state management
- Complex validation and error handling
- Accessibility and responsive design
- Internationalization and localization
- Cross-platform compatibility and custom styling

By providing a complete solution for these challenges, TanStack Form empowers developers to build robust and user-friendly forms with ease.

## Enough talk, show me some code already!

In the example below, you can see TanStack Form in action with the React framework adapter:

[Open in CodeSandbox](https://codesandbox.io/s/github/tanstack/form/tree/main/examples/react/simple)

```tsx
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

export default function App() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <div>
      <h1>Simple Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A first name is required'
                  : value.length < 3
                    ? 'First name must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label htmlFor={field.name}>First Name:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="lastName"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Last Name:</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </button>
          )}
        />
      </form>
    </div>
  )
}

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(<App />)
```

## You talked me into it, so what now?

- Learn TanStack Form at your own pace with our thorough [Walkthrough Guide](./installation) and [API Reference](./reference/classes/FormApi)

### Deployment

The application deploys to **Cloudflare Pages** with **Convex** backend:

#### Cloudflare Pages Configuration

- Configuration in `wrangler.jsonc`
- Build output directory: `dist/`
- Project name: `eats`
- Compatibility date: `2025-09-02`

#### Authentication Middleware

Basic authentication is configured via Cloudflare Workers middleware (`functions/_middleware.js`):

- Protects all pages with HTTP Basic Auth
- Credentials are hardcoded in the middleware file (update for production use)
- Runs on every request before serving static assets

#### GitHub Actions CI/CD

Automated deployment pipeline (`.github/workflows/deploy.yml`):

1. Triggers on push to `main` branch or manual workflow dispatch
2. Uses Node.js 24 and pnpm 10.26.1
3. Builds the application with Vite
4. Deploys backend to Convex
5. Deploys frontend to Cloudflare Pages

Required GitHub secrets:

- `CONVEX_DEPLOY_KEY` - Convex deployment key
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

Required GitHub variables:

- `VITE_CONVEX_URL` - Convex deployment URL

## Environment Setup

Create a `.env.local` file with:

```
VITE_CONVEX_URL=<your-convex-deployment-url>
CONVEX_DEPLOYMENT=<your-deployment>
```

Run `npx convex init` to set these automatically.

## Code Quality

- **Linting**: ESLint with TanStack config (`eslint.config.js`)
- **Formatting**: Prettier (`prettier.config.js`)
- **TypeScript**: Strict mode enabled, no unused variables/parameters
- **Testing**: Vitest with React Testing Library

## Key Dependencies

### Core Framework

- React 19.2.0 with React DOM
- TypeScript 5.7.2
- Vite 7.1.7

### TanStack Ecosystem

- @tanstack/react-router: 1.132.0 (file-based routing)
- @tanstack/react-query: 5.66.5 (data fetching)
- @tanstack/react-form: 1.0.0 (form state management)
- @tanstack/devtools-vite: 0.3.11 (unified dev tools)

### Backend & Data

- convex: 1.27.3 (serverless backend)
- @convex-dev/react-query: 0.0.0-alpha.11 (Convex + React Query adapter)
- zod: 4.1.11 (schema validation)

### UI & Styling

- tailwindcss: 4.0.6
- @tailwindcss/vite: 4.0.6
- lucide-react: 0.544.0 (icon library)
- Radix UI components (label, select, slider, slot, switch)

### Deployment

- wrangler: 4.54.0 (Cloudflare Pages deployment)
- concurrently: 8.2.2 (run multiple dev commands)

## Important Conventions

- Routes are generated automatically; avoid editing `src/routeTree.gen.ts`
- Demo files (prefixed with `demo.`) can be safely deleted
- Convex generated files in `convex/_generated/` are auto-generated; don't edit
- Path aliases: `~/*` maps to `src/*` and `~convex/*` maps to `convex/*`
- Use Shadcn for UI components to maintain consistency
  - Style: `new-york`
  - Icon library: `lucide-react`
  - Base color: `zinc`
- Convex schema uses the `v` validator builder for type-safe field definitions
- Authentication middleware in `functions/_middleware.js` protects the deployed site

## File Structure Highlights

```
src/
  routes/            # File-based routing (auto-generated tree in routeTree.gen.ts)
    demo/           # Demo routes (forms, Convex, TanStack Query)
  components/        # React components
    ui/             # Shadcn UI components
  integrations/      # Provider integrations (Convex, TanStack Query)
  hooks/            # Custom hooks
  lib/              # Utilities (e.g., cn() for class merging)
  styles.css        # Global Tailwind styles
  main.tsx          # App entry point with router and providers

convex/
  schema.ts         # Database schema definition
  todos.ts          # Example backend functions
  _generated/       # Auto-generated types and client

functions/
  _middleware.js    # Cloudflare Workers auth middleware

.github/
  workflows/
    deploy.yml      # CI/CD deployment workflow

wrangler.jsonc      # Cloudflare Pages configuration
components.json     # Shadcn UI configuration
vite.config.ts      # Vite configuration with plugins
tsconfig.json       # TypeScript configuration with path aliases
```
