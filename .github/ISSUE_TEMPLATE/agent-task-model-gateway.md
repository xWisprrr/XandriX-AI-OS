---
name: "🤖 Agent Task — Model Gateway"
about: "Assign a Copilot agent to build a specific part of the XandriX Model Gateway"
title: "[Model Gateway] "
labels: ["agent-task", "service:model-gateway", "phase:0"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the Model Gateway service -->

## Service: `services/model-gateway`

**Responsible for:** Flagship model routing, streaming completions, provider abstraction, and lazy tool loading.

**Current state of service:** See `services/model-gateway/src/` — Express app, `ModelRouter`, `StubProvider`, and REST/SSE routes are scaffolded. Real provider integrations are not yet wired.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] All new code has matching unit tests in `src/__tests__/`
- [ ] HTTP endpoints return correct status codes and response shapes

## Scope Boundaries

This agent should only modify files inside:
- `services/model-gateway/`
- `packages/xandrix-types/` (add types if needed)

Do **not** modify other services or apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
- [`packages/xandrix-types/src/index.ts`](../../packages/xandrix-types/src/index.ts)
