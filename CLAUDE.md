# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TanStack-based React application using modern tooling and integrations. It's a full-stack application combining:

- **Frontend**: React 19 with TanStack Router (file-based routing), TanStack Query, and TanStack Form
- **Backend**: Convex (serverless backend)
- **Styling**: Tailwind CSS v4 with Shadcn components
- **Package Manager**: pnpm

The application is in early development with demo routes showcasing forms, data fetching, and Convex integration.

## Build and Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (runs on port 3000)
pnpm dev

# Build for production (includes TypeScript checking)
pnpm build

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

# Start Convex development server (required for backend)
npx convex dev

# Initialize Convex (sets up environment variables)
npx convex init
```

## Architecture

### Routing

Uses **TanStack Router v1** with file-based routing. Routes are defined as files in `src/routes/`:

- `src/routes/__root.tsx` - Root layout with Convex provider, Header, and devtools
- `src/routes/index.tsx` - Home route
- `src/routes/demo/*` - Demo routes for features

Router is configured in `src/main.tsx` with auto code splitting enabled. The root route context provides the QueryClient to all child routes.

### Data Fetching

Integrated with **TanStack Query v5** for data fetching:

- QueryClient is created in `src/integrations/tanstack-query/root-provider.tsx`
- Convex queries use `@convex-dev/react-query` adapter for integration
- TanStack Router's loader API can be used as an alternative for route-specific data loading

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

Demo form integrations available:

- `src/hooks/demo.form.ts` - Basic TanStack Form usage
- `src/hooks/demo.form-context.ts` - Context-based form state
- `src/components/demo.FormComponents.tsx` - Form component examples

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

## Important Conventions

- Routes are generated automatically; avoid editing `src/routeTree.gen.ts`
- Demo files (prefixed with `demo.`) can be safely deleted
- Convex generated files in `convex/_generated/` are auto-generated; don't edit
- Path alias `~/*` maps to `src/*`
- Use Shadcn for UI components to maintain consistency
- Convex schema uses the `v` validator builder for type-safe field definitions

## File Structure Highlights

```
src/
  routes/            # File-based routing (auto-generated tree in routeTree.gen.ts)
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
```
