---
name: "🤖 Agent Task — Auth Service"
about: "Assign a Copilot agent to build a specific part of the XandriX Auth service"
title: "[Auth] "
labels: ["agent-task", "service:auth", "phase:0"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the Auth service -->

## Service: `services/auth`

**Responsible for:** User registration, login, JWT access/refresh token management, and token revocation.

**Current state of service:** See `services/auth/src/` — Express app, JWT utilities, and stub register/login/refresh routes are scaffolded. Database integration is not yet wired.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] All new code has matching unit tests in `src/__tests__/`
- [ ] HTTP endpoints return correct status codes and response shapes

## Scope Boundaries

This agent should only modify files inside:
- `services/auth/`
- `packages/xandrix-types/` (add types if needed)
- `db/migrations/` (add new migration files, do not modify `0001_initial_schema.sql`)

Do **not** modify other services or apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
- [`db/migrations/0001_initial_schema.sql`](../../db/migrations/0001_initial_schema.sql)
