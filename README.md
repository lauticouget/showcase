# Showcase

A full-stack serverless application built as a portfolio project demonstrating modern cloud-native architecture.

## Stack

| Layer | Technology |
|---|---|
| API | Apollo GraphQL, AWS Lambda, Node.js 24 |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Database | Amazon DynamoDB |
| Infrastructure | AWS SAM, CloudFormation |
| Monorepo | Nx 22, PNPM |
| Language | TypeScript throughout |

## Architecture

```
apps/
  api/       # Apollo GraphQL server → deployed as AWS Lambda
  web/       # Next.js 16 app → deployed to AWS Amplify
infra/
  template.yaml              # SAM/CloudFormation template
  docker-compose.local.yaml  # DynamoDB Local for development
scripts/
  create-local-table.mjs     # Bootstraps local DynamoDB tables
```

The API follows a domain/feature module pattern — each feature owns its GraphQL schema, resolvers, and repository. Generic DynamoDB utilities (`scanPage`, `updateItem`, `timedOperation`) live in `apps/api/src/lib/dynamoUtils.ts` and are shared across all repositories.

## Prerequisites

- Node.js 24
- PNPM
- Docker (for DynamoDB Local)
- AWS SAM CLI
- Python + cfn-lint (`pip install cfn-lint`)

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure local environment

```bash
cp infra/env.local.json.example infra/env.local.json
```

### 3. Start everything

```bash
pnpm dev:api
```

This starts DynamoDB Local, builds the API in watch mode, and starts SAM Local with a debugger on port 9229.

The GraphQL endpoint is available at `http://localhost:3000/graphql`.

### Individual commands

```bash
# DynamoDB Local only
pnpm dynamo:start
pnpm dynamo:stop

# API build (watch mode)
pnpm watch:api

# SAM Local (no debugger)
pnpm sam

# Next.js dev server
nx dev web
```

## Build & Deployment

```bash
# Build API
nx build api

# Build web app
nx build web

# Deploy infrastructure + API
sam deploy --guided
```

## Testing

```bash
nx test api
nx test web
nx e2e api-e2e
nx e2e web-e2e
```

## Linting & Type Checking

```bash
nx lint api
nx lint web
nx typecheck api
nx typecheck web
```

## Project Structure (API)

```
apps/api/src/
  handler.ts          # Lambda entry point
  schema/index.ts     # Merges all modules into executable schema
  lib/
    dynamodb.ts       # DynamoDB client singleton
    dynamoUtils.ts    # Generic DynamoDB operations
    errors.ts         # Error codes and classes
    logger.ts         # Lambda Powertools logger
  modules/
    health/           # Health check
    users/            # Users CRUD
    [feature]/        # Add new features here
```
