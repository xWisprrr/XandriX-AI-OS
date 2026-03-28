# XandriX AI OS — System Blueprint

This document is the canonical specification for all XandriX AI OS services, their APIs, data models, and integration contracts. All agent work must be consistent with this blueprint.

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Surfaces                      │
│  XandriX Chat (Web)  │  Studio  │  CLI  │  VS Code      │
└───────────────────┬──────────────────────────────────────┘
                    │ HTTP / WebSocket / SSE
┌───────────────────▼──────────────────────────────────────┐
│                XandriX Orchestrator :3003                │
│  Task decomposition · Agent routing · Approval workflow  │
│  State machine · Action timeline · Child task spawning   │
└──────┬────────────────────────┬────────────────────────┬─┘
       │                        │                        │
┌──────▼──────┐   ┌─────────────▼────────┐   ┌──────────▼──┐
│ Model GW    │   │  Agent Runtime :3005  │   │  Memory     │
│ :3002       │   │  Planner · Coder      │   │  :3004      │
│ Flagship    │   │  Reviewer · Debugger  │   │  Workspace  │
│ routing     │   │  Test · SecureOps     │   │  context    │
└─────────────┘   └──────────────────────┘   └─────────────┘
       │
┌──────▼──────┐   ┌────────────────────┐   ┌──────────────┐
│ Auth :3001  │   │  Workspace :3006   │   │  Deployment  │
│ JWT tokens  │   │  File system ops   │   │  :3007       │
│ RBAC        │   │  Repo management   │   │  Preview/prod│
└─────────────┘   └────────────────────┘   └──────────────┘

         ┌─────────────────────────────────┐
         │  PostgreSQL  │  Redis  │  S3     │
         └─────────────────────────────────┘
```

---

## Service Contracts

### Auth Service (`services/auth`, port 3001)

**Purpose:** Issue and validate JWT tokens; manage users and sessions.

**Endpoints:**
```
POST   /auth/register          Register a new user
POST   /auth/login             Authenticate and receive tokens
POST   /auth/refresh           Exchange refresh token for new access token
POST   /auth/logout            Revoke refresh token
GET    /health                 Health check
```

**Token format:** Standard JWT, HS256. Access tokens expire in 15m. Refresh tokens expire in 7d and are stored hashed in `refresh_tokens` table.

---

### Model Gateway (`services/model-gateway`, port 3002)

**Purpose:** Abstract multiple model providers behind a single unified API. Route requests to the correct provider based on model ID. Support streaming.

**Endpoints:**
```
GET    /models                 List available models
POST   /complete               Non-streaming completion
POST   /stream                 Streaming completion (SSE)
GET    /health                 Health check
```

**Request format (`POST /complete`):**
```json
{
  "modelId": "xandrix-flagship-v1",
  "messages": [{ "role": "user", "content": "Hello" }],
  "maxTokens": 2048,
  "temperature": 0.7
}
```

**Providers (planned):**
- `StubProvider` — local dev/testing (implemented)
- `OpenAIProvider` — OpenAI API (planned)
- `AnthropicProvider` — Anthropic API (planned)

---

### Orchestrator (`services/orchestrator`, port 3003)

**Purpose:** Central runtime. Accepts high-level goals, decomposes them into tasks, routes tasks to agents, manages approval workflow, and maintains the action timeline.

**Endpoints:**
```
POST   /tasks                  Create a new task
GET    /tasks                  List tasks (filter by sessionId)
GET    /tasks/:id              Get task details
PATCH  /tasks/:id/status       Update task status
GET    /tasks/:id/timeline     Get action timeline for task
GET    /approvals              List pending approvals
PATCH  /approvals/:id          Resolve an approval (approve/reject)
POST   /agents                 Spawn an agent
GET    /agents                 List agents
GET    /health                 Health check
```

**Task state machine:**
```
pending → planning → running → completed
                   → awaiting_approval → running
                   → paused → running
                   → failed
                   → cancelled
any → rolled_back
```

---

### Memory Service (`services/memory`, port 3004)

**Purpose:** Store and retrieve workspace-scoped memory entries — project conventions, user preferences, architecture notes, error patterns, and approved tools.

**Endpoints:**
```
POST   /memory                 Create or update a memory entry
GET    /memory?workspaceId=…   List memory entries for workspace
GET    /memory?workspaceId=…&q=… Search memory entries
GET    /memory/:id             Get a single entry
DELETE /memory/:id             Delete an entry
GET    /health                 Health check
```

---

## Data Model Summary

All entity definitions live in `packages/xandrix-types/src/index.ts`.

Key entities:
- `User` — authenticated user with role (owner/admin/member/viewer)
- `Workspace` — a project workspace with optional git repo attachment
- `Session` — an active connection from a surface (chat/terminal/studio/etc.)
- `Task` — a goal being executed, with status, plan steps, and approval policy
- `Agent` — a specialist agent instance with role, status, and model assignment
- `ApprovalRequest` — a gated action awaiting human approval
- `ActionEvent` — a single entry in the task action timeline
- `Message` — a conversation message in a session
- `MemoryEntry` — a stored workspace memory fact
- `Deployment` — a deployment record (preview/staging/production)
- `SecurityFinding` — a SecureOps finding with severity and remediation

---

## Approval Policy

Every task has an `ApprovalPolicy`:

```typescript
type ApprovalMode = 'always' | 'high_risk_only' | 'auto_safe';

type ApprovalPolicy = {
  mode: ApprovalMode;
  allowedTools: string[] | '*';
  blockedTools: string[];
};
```

Risk levels for actions:
- `safe` — read-only operations (auto-allowed in all modes)
- `low` — low-impact writes (auto-allowed in `auto_safe`)
- `medium` — significant writes (requires approval in `always`, auto-allowed in `auto_safe`)
- `high` — destructive or wide-scope operations (requires approval in `high_risk_only` and `always`)
- `critical` — irreversible or security-sensitive (always requires approval)

---

## Agent Roles

| Role | Responsibility | Default Model |
|---|---|---|
| `planner` | Decomposes goals into structured task graphs | flagship |
| `coder` | Generates and edits code | flagship |
| `reviewer` | Reviews diffs and identifies issues | flagship |
| `debugger` | Diagnoses failures and proposes repairs | flagship |
| `test` | Generates tests and runs suites | flagship |
| `navigator` | Reads and maps repositories | specialist |
| `deployment` | Prepares and coordinates deployments | flagship |
| `memory` | Manages context and memory | specialist |
| `secureops` | Runs defensive security analysis | flagship |

---

## Environment Variables

### Auth Service
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | `3001` | HTTP port |
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **yes** | — | Access token signing secret (≥32 chars) |
| `JWT_REFRESH_SECRET` | **yes** | — | Refresh token signing secret (≥32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | no | `7d` | Refresh token TTL |
| `NODE_ENV` | no | `development` | Environment |

### Model Gateway
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | `3002` | HTTP port |
| `PROVIDER` | no | `stub` | Active provider: `stub` \| `openai` \| `anthropic` |
| `OPENAI_API_KEY` | if provider=openai | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | if provider=anthropic | — | Anthropic API key |
| `NODE_ENV` | no | `development` | Environment |

### Orchestrator
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | `3003` | HTTP port |
| `NODE_ENV` | no | `development` | Environment |

### Memory Service
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | no | `3004` | HTTP port |
| `NODE_ENV` | no | `development` | Environment |

---

## Inter-Service Communication

Services communicate over HTTP. In production they use internal DNS (e.g. `http://auth:3001`). In development, use `localhost` with the port numbers above.

Future: add gRPC for high-throughput agent-to-orchestrator communication.

---

## Security Requirements

- All user-facing endpoints require a valid JWT access token (except `/auth/*` and `/health`)
- Passwords stored as bcrypt hashes (cost factor ≥ 12)
- Refresh tokens stored hashed in the database; revoked on logout
- All shell command executions go through the approval workflow
- Secrets never logged or stored in plaintext
- CORS restricted to allowed origins in production
- Rate limiting on auth endpoints

---

## Testing Strategy

- **Unit tests**: `vitest` in each service package, co-located in `src/__tests__/`
- **Integration tests**: test against real PostgreSQL using Docker (future)
- **E2E tests**: Playwright for web app (future)
- **Eval harness**: goal-oriented correctness evaluation (Phase 5+)

Run all tests: `pnpm test`
Run tests for one service: `pnpm --filter @xandrix/orchestrator test`
