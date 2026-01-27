# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo containing:
- **apps/api**: Apollo GraphQL server deployed as AWS Lambda (Node.js 24)
- **apps/web**: Next.js 16 web application with React 19
- **apps/api-e2e**: E2E tests for API
- **apps/web-e2e**: E2E tests for web app using Playwright

Tech stack:
- Nx 22.2.0 for monorepo management
- PNPM for package management
- TypeScript throughout
- AWS SAM for infrastructure deployment
- esbuild for API bundling
- Next.js frontend framework
- Tailwind CSS for styling

## Architecture

### GraphQL API (apps/api)

The API uses a **domain/feature-based modular structure**:

```
apps/api/src/
  handler.ts              # Lambda entry point
  schema/
    index.ts              # Creates executable schema from modules
  modules/
    index.ts              # Merges all module typeDefs and resolvers
    health/               # Example module
      typeDefs.ts         # GraphQL types for this feature
      resolvers.ts        # Resolvers for this feature
      index.ts            # Exports both
    [feature]/            # Add new features as modules
      typeDefs.ts
      resolvers.ts
      index.ts
```

**Adding a new feature:**
1. Create folder `apps/api/src/modules/[feature]/`
2. Add `typeDefs.ts`, `resolvers.ts`, and `index.ts`
3. Import and add to the modules array in `modules/index.ts`

The API builds to CommonJS format (.cjs) and is deployed to AWS Lambda via SAM. The SAM template ([infra/template.yaml](infra/template.yaml)) configures:
- HTTP API with POST /graphql endpoint
- 256 MB memory, 15 second timeout
- CodeUri points to dist/apps/api

### Next.js Web App (apps/web)

Standard Next.js 16 app using:
- App Router architecture
- React 19 with server components
- Tailwind CSS for styling
- TypeScript

## Common Commands

### Build & Development

```bash
# Build API for Lambda deployment
nx build api

# Build Next.js web app
nx build web

# Run Next.js dev server
nx dev web

# Serve API locally (not SAM)
nx serve api

# Local Lambda development with SAM
pnpm api
```

### Testing

```bash
# Run all tests
nx test

# Run specific project tests
nx test api
nx test web

# Run E2E tests
nx e2e api-e2e
nx e2e web-e2e

# Run single test file
nx test web --testFile=specs/index.spec.tsx
```

### Linting & Type Checking

```bash
# Lint all projects
nx lint

# Lint specific project
nx lint api
nx lint web

# Type check
nx typecheck api
nx typecheck web
```

### Infrastructure & Deployment

```bash
# Start SAM local API (runs Lambda locally)
pnpm api
# This runs: sam local start-api -t ./infra/template.yaml

# Before deploying, ensure API is built
nx build api

# Deploy with SAM (example)
sam deploy --guided
```

### Nx Utilities

```bash
# Visualize project graph
nx graph

# See affected projects
nx affected:graph

# Sync TypeScript project references
nx sync

# Run command for all projects
nx run-many --target=build --all
```

## Key Configuration Files

- **nx.json**: Nx workspace configuration with plugin settings
- **package.json**: Root dependencies and workspace scripts
- **apps/api/package.json**: API-specific Nx build targets (esbuild, prune-lockfile, etc.)
- **apps/web/package.json**: Web app dependencies
- **infra/template.yaml**: AWS SAM CloudFormation template
- **jest.config.ts**: Root Jest configuration (uses `getJestProjectsAsync()`)

## Development Workflow

1. **Adding a GraphQL Feature Module**:
   - Create new folder: `apps/api/src/modules/[feature]/`
   - Add `typeDefs.ts` with GraphQL schema definitions
   - Add `resolvers.ts` with resolver functions
   - Add `index.ts` to export both
   - Register in `apps/api/src/modules/index.ts`

2. **Lambda Deployment Preparation**:
   - Run `nx build api` to compile to dist/apps/api
   - The build uses esbuild with CommonJS format (outputs .cjs files)
   - SAM template references this dist folder

3. **Next.js Pages/Components**:
   - Use App Router structure in apps/web/src/app/
   - Tailwind CSS is pre-configured

4. **Testing**:
   - Jest for unit tests (*.spec.ts, *.spec.tsx)
   - Playwright for E2E tests
   - Tests depend on build target completing first

## Nx Target Dependencies

- `test` depends on `^build` (builds dependencies first)
- `@nx/esbuild:esbuild` is cached and depends on `^build`
- API `prune` target orchestrates lockfile pruning and workspace module copying for Lambda deployment
