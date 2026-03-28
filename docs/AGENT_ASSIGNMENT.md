# XandriX AI OS — Multi-Agent Development Guide

This document explains how to split XandriX AI OS development across multiple GitHub Copilot agents working in parallel, so each agent builds a well-scoped part of the system without stepping on other agents.

---

## How It Works

Each major subsystem of XandriX AI OS maps to a **scoped GitHub Issue** with a dedicated `agent-task` label and a service/app label. When you assign that issue to GitHub Copilot, the agent receives clear scope boundaries, the current state of the codebase, and explicit acceptance criteria — so it can work in parallel with other agents without conflicts.

---

## Monorepo Scope Map

Each agent is confined to **one slice** of the monorepo. The slices are designed to be independently buildable:

| Agent Slice | Directory | Depends On | Phase |
|---|---|---|---|
| **Shared Types** | `packages/xandrix-types/` | nothing | 0 |
| **Auth Service** | `services/auth/` | `@xandrix/types` | 0 |
| **Model Gateway** | `services/model-gateway/` | `@xandrix/types` | 0 |
| **Orchestrator** | `services/orchestrator/` | `@xandrix/types` | 0 |
| **Memory Service** | `services/memory/` | `@xandrix/types` | 0 |
| **XandriX Chat (Web)** | `apps/web/` | `@xandrix/types`, `@xandrix/ui` | 1 |
| **XandriX Studio** | `apps/studio/` | `@xandrix/types`, `@xandrix/ui` | 3 |
| **Terminal Agent CLI** | `cli/` | `@xandrix/types` | 2 |
| **VS Code Extension** | `plugins/vscode/` | `@xandrix/types` | 4 |
| **Deployment Service** | `services/deployment/` | `@xandrix/types` | 6 |
| **SecureOps Service** | `services/secureops/` | `@xandrix/types` | 7 |
| **Shared UI Components** | `packages/xandrix-ui/` | `@xandrix/types` | 1 |
| **SDK** | `packages/xandrix-sdk/` | `@xandrix/types` | 1 |

---

## How to Assign Work to a Copilot Agent

### Step 1 — Create an Issue Using the Right Template

Go to **Issues → New Issue** and select the template that matches the subsystem you want to build:

| Template | Subsystem |
|---|---|
| `agent-task-auth.md` | Auth Service |
| `agent-task-orchestrator.md` | Orchestrator Service |
| `agent-task-model-gateway.md` | Model Gateway |
| `agent-task-memory.md` | Memory Service |
| `agent-task-web.md` | XandriX Chat Web App |
| `agent-task-cli.md` | Terminal Agent CLI |

Fill in:
- A clear, specific **title** (e.g. `[Auth] Wire PostgreSQL user persistence into register/login endpoints`)
- A concrete **task description** — one focused unit of work per issue
- Specific **acceptance criteria** — what "done" looks like

### Step 2 — Assign the Issue to GitHub Copilot

On the issue, click **Assignees → GitHub Copilot**. Copilot will create a branch, implement the changes, run tests, and open a PR.

### Step 3 — Review the PR

Copilot's PR will target `main`. Review the changes, request any corrections, and merge when ready.

---

## Parallelism Rules

To prevent merge conflicts and dependency loops, follow these rules:

### ✅ Safe to run in parallel

Any combination of these can run at the same time because they modify non-overlapping directories:

- Auth Service + Model Gateway + Orchestrator + Memory (all different `services/` subdirs)
- XandriX Chat (web) + Terminal Agent CLI (different top-level dirs)
- Shared UI Library + Shared SDK (different `packages/` subdirs)

### ⚠️ Coordinate carefully

- **Shared Types (`packages/xandrix-types/src/index.ts`)**: Only one agent should modify this at a time. If two agents both need new types, either: (a) have one agent add all needed types first, or (b) have each agent add types in separate named exports and merge manually.
- **Database migrations (`db/migrations/`)**: Each agent that adds a migration must use a new file (e.g. `0002_...sql`, `0003_...sql`). Never modify `0001_initial_schema.sql`.
- **`docker-compose.yml`**: Coordinate when adding new services.

### ❌ Never let two agents modify the same file simultaneously

Each agent PR should only touch files within its declared scope. The issue templates enforce this via the "Scope Boundaries" section.

---

## Current Build State (Phase 0 — Foundations)

All services listed below have been scaffolded. The scaffolds compile to TypeScript and have working Express HTTP servers. The next step for each is to wire them to PostgreSQL and add real business logic.

| Service | Port | Status |
|---|---|---|
| `services/auth` | 3001 | ✅ Scaffolded — needs DB wiring |
| `services/model-gateway` | 3002 | ✅ Scaffolded — stub provider only |
| `services/orchestrator` | 3003 | ✅ Scaffolded — in-memory state only |
| `services/memory` | 3004 | ✅ Scaffolded — in-memory store only |
| `apps/web` | 3000 | ✅ Landing page — no chat UI yet |
| `cli` | — | ✅ Commands scaffolded — orchestrator not wired yet |

---

## Local Development Setup

```bash
# Install dependencies
pnpm install

# Build shared packages first
pnpm --filter @xandrix/types build

# Start all services (requires Docker)
docker-compose up -d postgres redis

# Run a specific service in dev mode
pnpm --filter @xandrix/orchestrator dev

# Build everything
pnpm build

# Type-check everything
pnpm typecheck
```

---

## Branch Strategy for Multi-Agent Work

Each agent creates its own branch:

```
copilot/auth-postgres-persistence
copilot/orchestrator-state-machine
copilot/model-gateway-openai-provider
copilot/web-chat-ui
```

Merge order recommendation:
1. `packages/xandrix-types` changes first
2. Service changes (can be merged in any order — they don't depend on each other)
3. App changes last (depend on services being finalized)

---

## Suggested First Issues to Open

Copy these into GitHub Issues and assign each to a Copilot agent:

1. **[Auth] Wire PostgreSQL persistence into register and login endpoints**
   - Connect `services/auth` to the `users` and `refresh_tokens` tables
   - Use the schema in `db/migrations/0001_initial_schema.sql`
   - Hash passwords with bcrypt, store and validate from DB

2. **[Orchestrator] Implement state machine transitions and child task spawning**
   - Add state transition validation (invalid transitions should error)
   - Add `POST /tasks/:id/spawn-child` endpoint for parallel sub-tasks
   - Add `GET /tasks/:id/children` endpoint

3. **[Model Gateway] Add OpenAI-compatible provider**
   - Add `services/model-gateway/src/providers/openai.ts` implementing `ModelProvider`
   - Load `OPENAI_API_KEY` from env
   - Support streaming via SSE

4. **[Memory] Wire PostgreSQL persistence into the memory service**
   - Replace in-memory `MemoryStore` with PostgreSQL-backed implementation
   - Add full-text search using PostgreSQL `tsvector`

5. **[Web] Build the XandriX Chat conversation UI**
   - Add `/chat` route with message list, input box, and streaming message support
   - Connect to `services/model-gateway` for completions
   - Connect to `services/orchestrator` for task status

6. **[CLI] Add `xandrix review` command for branch diff review**
   - Accept `--branch` and `--base` flags
   - Use git diff, send to model gateway for review
   - Display structured findings in the terminal
