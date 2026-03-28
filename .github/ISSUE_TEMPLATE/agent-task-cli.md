---
name: "🤖 Agent Task — Terminal Agent CLI"
about: "Assign a Copilot agent to build a specific part of the XandriX Terminal Agent CLI"
title: "[CLI] "
labels: ["agent-task", "app:cli", "phase:2"]
assignees: []
---

## Task Description

<!-- Describe exactly what this agent should build in the CLI -->

## Package: `cli`

**Responsible for:** XandriX Terminal Agent — `xandrix task`, `xandrix attach`, `xandrix resume`, `xandrix status`, `xandrix review`, and `xandrix deploy` commands.

**Current state:** See `cli/src/` — Commander-based CLI with task, attach, resume, and status commands scaffolded. File editing, build/test loops, and Git integration not yet implemented.

## Acceptance Criteria

- [ ] <!-- List specific, testable requirements -->
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Commands behave correctly when orchestrator is running locally

## Scope Boundaries

This agent should only modify files inside:
- `cli/`
- `packages/xandrix-types/` (add types if needed)

Do **not** modify other services or apps.

## Related Docs

- [`docs/SYSTEM_BLUEPRINT.md`](../../docs/SYSTEM_BLUEPRINT.md)
- [`docs/AGENT_ASSIGNMENT.md`](../../docs/AGENT_ASSIGNMENT.md)
