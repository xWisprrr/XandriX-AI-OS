---
name: "🤖 Agent Task — XandriX Chat (Web App)"
about: "Assign a Copilot agent to build a specific part of the XandriX Chat Next.js app"
title: "[Web] "
labels: ["agent-task", "app:web", "phase:1"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the web app -->

## App: `apps/web`

**Responsible for:** XandriX Chat web UI — multi-turn conversations, task delegation, approval panel, memory panel, and live task timeline.

**Current state:** See `apps/web/src/` — Next.js App Router project with a landing page. No chat UI, routing, or API integration yet.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] `next build` succeeds without errors
- [ ] Components are in `apps/web/src/components/`

## Scope Boundaries

This agent should only modify files inside:
- `apps/web/`
- `packages/xandrix-ui/` (add shared components if needed)
- `packages/xandrix-types/` (add types if needed)

Do **not** modify services or other apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
