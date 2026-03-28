---
name: "🤖 Agent Task — Orchestrator Service"
about: "Assign a Copilot agent to build a specific part of the XandriX Orchestrator service"
title: "[Orchestrator] "
labels: ["agent-task", "service:orchestrator", "phase:0"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the Orchestrator service -->

## Service: `services/orchestrator`

**Responsible for:** Task decomposition, agent routing, state machine, approval workflow, and action timeline.

**Current state of service:** See `services/orchestrator/src/` — the basic Express app, `TaskRegistry`, `AgentPool`, and REST routes are scaffolded.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] All new code has matching unit tests in `src/__tests__/`
- [ ] HTTP endpoints return correct status codes and response shapes

## Scope Boundaries

This agent should only modify files inside:
- `services/orchestrator/`
- `packages/xandrix-types/` (add types if needed)

Do **not** modify other services or apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
- [`packages/xandrix-types/src/index.ts`](../../packages/xandrix-types/src/index.ts)
