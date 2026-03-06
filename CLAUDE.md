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
  lib/
    dynamodb.ts           # DynamoDB client singleton
    dynamoUtils.ts        # Generic DynamoDB operations
    errors.ts             # AppError, AppErrorCode, GraphQLErrorCode, DynamoErrorName
    logger.ts             # AWS Lambda Powertools logger
  modules/
    index.ts              # Merges all module typeDefs and resolvers
    health/               # Health check module
    users/                # Users CRUD module
      typeDefs.ts         # GraphQL schema
      resolvers.ts        # Resolvers (imports GraphQLErrorCode, DynamoErrorName from lib/errors)
      userRepository.ts   # DynamoDB operations for users
      index.ts            # Exports typeDefs and resolvers
    [feature]/            # Add new features as **modules**
```

**Adding a new feature:**
1. Create folder `apps/api/src/modules/[feature]/`
2. Add `typeDefs.ts`, `resolvers.ts`, and `index.ts`
3. Import and add to the modules array in `modules/index.ts`

The API builds to CommonJS format (.cjs) and is deployed to AWS Lambda via SAM. The SAM template ([infra/template.yaml](infra/template.yaml)) configures:
- HTTP API with POST /graphql endpoint
- 256 MB memory, 15 second timeout
- CodeUri points to dist/apps/api
- DynamoDB table with PAY_PER_REQUEST billing, SSE enabled, DeletionPolicy/UpdateReplacePolicy: Retain

### DynamoDB Layer

Generic utilities live in `lib/dynamoUtils.ts` — do not duplicate these in repositories:
- `scanPage<T>(tableName, limit, cursor?)` — paginated scan with base64url cursor
- `updateItem<T>(tableName, key, fields)` — builds UpdateExpression dynamically; sets `updatedAt` automatically
- `timedOperation(tableName, operation, fn)` — wraps any DynamoDB call with debug/info/error logging

Repository pattern: each feature has its own `[feature]Repository.ts` that uses these utilities. Table name comes from an env var validated at module load time via IIFE (throws on missing var).

**`getUser` union input pattern**: repositories that need to look up by multiple unique keys use a discriminated union input — `getUser({ userId })` uses `GetCommand` on the primary key; `getUser({ email })` uses `QueryCommand` on a GSI. Never use `ScanCommand` for unique-key lookups.

**UsersTable indexes:**
- Primary key: `userId` (hash) — `GetCommand`
- GSI `email-index`: `email` (hash), `ProjectionType: ALL` — `QueryCommand` with `IndexName: 'email-index'`

### Error Handling

All error constants live in `lib/errors.ts`:
- `AppErrorCode` enum — infrastructure/business logic errors (e.g. `EmptyUpdate`)
- `AppError` class — thrown for business logic errors with typed codes
- `GraphQLErrorCode` enum — GraphQL extension codes (`NotFound`, `Unauthenticated`, `Forbidden`, `BadUserInput`, `InternalError`)
- `DynamoErrorName` const — DynamoDB error name strings (e.g. `ConditionalCheckFailed`)

Always use `GraphQLErrorCode` and `DynamoErrorName` in resolvers — never hardcode strings.

### Shared Library (libs/shared)

Cross-app constants and types live in `libs/shared` — published as `@showcase/shared`:

```
libs/shared/src/
  errors.ts     # GraphQLErrorCode enum
  index.ts      # Barrel export
```

The package uses a custom `@showcase/source` export condition so TypeScript resolvers (both API and web) import from the `.ts` source directly without a build step. `apps/api/src/lib/errors.ts` re-exports `GraphQLErrorCode` from here.

**Adding to the shared library**: add the export to `libs/shared/src/index.ts`, then run `pnpm install` once if adding a new package dependency.

### GraphQL Codegen

TypeScript types are **auto-generated** from the API GraphQL schema. Never write them by hand.

- Config: `codegen.ts` at workspace root
- Schema source: `apps/api/src/modules/**/typeDefs.ts`
- Operation documents: `apps/web/src/lib/graphql/operations/**/*.ts`
- Output: `apps/web/src/lib/graphql/generated/types.ts`

```bash
pnpm codegen   # regenerate after schema or operation changes
```

Operations files in `apps/web/src/lib/graphql/operations/` define GQL documents and re-export types from `generated/types.ts` — they do **not** contain hand-written interfaces.

### Next.js Web App (apps/web)

Standard Next.js 16 app using:
- App Router architecture
- React 19 with server components + client components (`'use client'`) with Apollo Client
- Tailwind CSS for styling
- TypeScript
- GraphQL operations defined in `apps/web/src/lib/graphql/operations/`
- Generated types imported from `apps/web/src/lib/graphql/generated/types.ts`

## Common Commands

### Build & Development

```bash
# Full local dev (starts DynamoDB, builds API in watch mode, starts SAM with debugger)
pnpm dev:api

# Start DynamoDB Local only
pnpm dynamo:start

# Stop DynamoDB Local
pnpm dynamo:stop

# Build API for Lambda deployment
pnpm build:api        # or: nx build api

# Watch mode build
pnpm watch:api

# Run Next.js dev server
nx dev web

# Start SAM local API (standard)
pnpm sam

# Start SAM local API with debugger on port 9229
pnpm sam:inspect
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
nx lint api
nx lint web

# Type check
nx typecheck api
nx typecheck web
```

### Infrastructure & Deployment

```bash
# Before deploying, ensure API is built
nx build api

# Deploy with SAM
sam deploy --guided
```

## Key Configuration Files

- **nx.json**: Nx workspace configuration with plugin settings
- **package.json**: Root dependencies and workspace scripts
- **apps/api/package.json**: API-specific Nx build targets (esbuild, prune-lockfile, etc.)
- **libs/shared/package.json**: Shared library with `@showcase/source` export condition
- **codegen.ts**: GraphQL Codegen config (schema → generated types)
- **infra/template.yaml**: AWS SAM CloudFormation template
- **infra/env.local.json**: Local env overrides for SAM (gitignored — copy from env.local.json.example)
- **infra/docker-compose.local.yaml**: DynamoDB Local container
- **scripts/create-local-table.mjs**: Creates DynamoDB tables for local development
- **.cfnlintrc.yaml**: cfn-lint configuration
- **.vscode/settings.json**: Editor config (yaml.customTags for CloudFormation, cfn-lint settings)
- **jest.config.ts**: Root Jest configuration

## Local Development Setup

DynamoDB Local runs in Docker on the `showcase-local` network. SAM Lambda containers also attach to this network and reach DynamoDB via `http://dynamodb-local:8000` (not `localhost`).

`pnpm dev:api` runs everything in sequence/parallel:
1. `dynamo:start` — starts Docker container, waits until healthy, creates tables
2. `watch:api` — esbuild in watch mode
3. `sam:inspect` — SAM local with debug port 9229
4. `watch:typecheck` — TypeScript watch

**Important**: SAM serves from `dist/apps/api`. Always rebuild after source changes before testing. Variables in `env.local.json` only override SAM env vars that are **already declared** in `template.yaml` — new variables must be declared in the template first (even as empty string).

## Development Workflow

1. **Adding a GraphQL Feature Module**:
   - Create new folder: `apps/api/src/modules/[feature]/`
   - Add `typeDefs.ts`, `resolvers.ts`, `index.ts`, `[feature]Repository.ts`
   - Validate table name env var via IIFE at module load time
   - Use `scanPage`, `updateItem`, `timedOperation` from `lib/dynamoUtils.ts`
   - Use `GraphQLErrorCode` and `DynamoErrorName` from `lib/errors.ts` in resolvers
   - Add `ConditionExpression: 'attribute_exists(pk)'` to UpdateItem and DeleteItem
   - Register in `apps/api/src/modules/index.ts`
   - Add DynamoDB table resource and `DynamoDBCrudPolicy` to `infra/template.yaml`

2. **Lambda Deployment Preparation**:
   - Run `nx build api` to compile to dist/apps/api
   - The build uses esbuild with CommonJS format (outputs .cjs files)
   - SAM template references this dist folder

3. **Next.js Pages/Components**:
   - Use App Router structure in apps/web/src/app/
   - Tailwind CSS is pre-configured
   - Add GraphQL operation documents to `apps/web/src/lib/graphql/operations/`
   - Run `pnpm codegen` after any schema or operation changes to regenerate `generated/types.ts`
   - Import types from `generated/types.ts` — never write them by hand

4. **Testing**:
   - Jest for unit tests (*.spec.ts, *.spec.tsx)
   - Playwright for E2E tests
   - Tests depend on build target completing first
   - **After any change that adds or modifies a React context provider, update all affected test files to wrap rendered components with that provider.** If a new context is added to `layout.tsx` or anywhere in the component tree, its provider must be added to the test wrappers too.

## CloudFormation / SAM Conventions

- All stateful resources (DynamoDB tables) must have `DeletionPolicy: Retain` and `UpdateReplacePolicy: Retain`
- Log groups use `DeletionPolicy: Delete` and `UpdateReplacePolicy: Delete`
- Use cfn-guard metadata suppression for intentionally skipped rules:
  ```yaml
  Metadata:
    guard:
      SuppressedRules:
        - RULE_NAME
  ```
- `!Ref` on a DynamoDB table returns the table name — use this to pass table names to Lambda env vars
- `DynamoDBCrudPolicy` SAM policy template grants Lambda full CRUD on a specific table

## Nx Target Dependencies

- `test` depends on `^build` (builds dependencies first)
- `@nx/esbuild:esbuild` is cached and depends on `^build`
- API `prune` target orchestrates lockfile pruning and workspace module copying for Lambda deployment

## Git Commits
- Git commit messages should be written like: `<branch name>: <API|WEB|API-WEB> | <feature>`.
And then a list of changes tabbed with "-" .