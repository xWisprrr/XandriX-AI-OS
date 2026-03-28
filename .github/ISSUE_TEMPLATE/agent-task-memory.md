---
name: "🤖 Agent Task — Memory Service"
about: "Assign a Copilot agent to build a specific part of the XandriX Memory service"
title: "[Memory] "
labels: ["agent-task", "service:memory", "phase:0"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the Memory service -->

## Service: `services/memory`

**Responsible for:** Workspace memory storage, retrieval, and semantic search. Supports project conventions, user preferences, architecture notes, error patterns, and approved tool lists.

**Current state:** See `services/memory/src/` — Express app, `MemoryStore` (in-memory), and CRUD REST routes are scaffolded. Database and vector search integration are not yet wired.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] All new code has matching unit tests in `src/__tests__/`
- [ ] HTTP endpoints return correct status codes and response shapes

## Scope Boundaries

This agent should only modify files inside:
- `services/memory/`
- `packages/xandrix-types/` (add types if needed)
- `db/migrations/` (add new migration files if needed)

Do **not** modify other services or apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
