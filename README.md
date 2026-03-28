# XandriX AI OS

A private, agentic, multi-surface AI ecosystem for building software end to end.

---

## What Is XandriX AI OS?

XandriX AI OS is a modular, production-grade autonomous AI software platform designed to serve as a unified operating environment for software engineering. It combines a secure web AI assistant, a terminal-based autonomous coding and automation agent, a browser-based AI IDE, editor-integrated coding agents for VS Code and JetBrains, a central orchestration and runtime layer, workspace memory and long-horizon task management, deployment and DevOps assistance, and a strictly defensive authorized security workflow layer — all under one cohesive platform.

XandriX AI OS is not a collection of disconnected tools. It is a single intelligent system built around a proprietary flagship AI model that acts as the primary reasoning, coding, planning, debugging, and long-horizon execution engine for the entire platform.

---

## Who Is It For?

XandriX AI OS is designed for:

- **Advanced solo engineers** who want an AI that can autonomously take a product idea through architecture, code, tests, and deployment.
- **Engineering teams** who want an agentic platform that fits into their existing Git, CI/CD, and editor workflows.
- **Enterprises** that require private, auditable, policy-enforced AI assistance with strict access control.

---

## Core Product Surfaces

### 1. XandriX Chat

A secure web AI assistant with full project awareness. Users can hold multi-turn technical conversations, delegate tasks to other runtime surfaces, review proposed changes, and monitor long-running autonomous workflows — all from a unified chat interface.

Key capabilities:
- Project-aware conversation with persistent workspace context
- Task delegation to XandriX Studio, XandriX Terminal Agent, or background runners
- Live task timeline showing reasoning state, files touched, commands run, and approvals
- Approval panel for reviewing and accepting or rejecting proposed actions
- Memory panel showing active project conventions, preferences, and history
- Model selector for switching between the flagship model and specialist variants

### 2. XandriX Terminal Agent

A command-line AI operator that executes approved development and automation tasks directly from the terminal. XandriX Terminal Agent can inspect repositories, edit files, run builds and tests, manage Git workflows, generate patches, and continue long-running sessions across restarts.

Key capabilities:
- CLI task invocation with repo attachment
- Shell command proposals with hierarchical approval flow (always ask / ask for high-risk / auto-allow safe)
- Resumable task sessions with checkpoint and rollback support
- Build and test loops with failure-aware self-healing retry logic
- Git integration including branch creation, commit, patch generation, and PR preparation
- Deploy preparation with environment inspection

Example commands:
```
xandrix task "refactor the auth module to use JWT refresh tokens"
xandrix attach --repo ./my-project
xandrix resume --session abc123
xandrix review --branch feature/new-api --base main
xandrix deploy --env staging
```

### 3. XandriX Studio

A browser-based AI IDE and workspace where users can generate, browse, edit, and deploy entire software projects. XandriX Studio provides a full project editing environment with real-time file operations, AI-assisted generation, an integrated terminal, diff and review mode, and deployment assistance — all in the browser.

Key capabilities:
- File tree with full project browsing and real-time AI-driven operations
- Code editor with inline AI suggestions, multi-file edits, and symbol-aware refactors
- Preview pane for rendering web app output in-browser
- Terminal pane for running commands with AI-monitored output
- Task sidebar showing active and queued agent work
- AI chat panel embedded in the IDE context
- Diff and review mode for previewing and approving changes before they are applied
- Deployment panel for one-click preview and production deployments
- Environment config and secrets panel
- Logs panel with structured streaming output

### 4. XandriX Code

Editor-integrated AI coding agent for VS Code and JetBrains. XandriX Code provides local codebase-aware assistance, inline edit suggestions, multi-file refactors, a commands palette, and a chat interface — all synchronized with the XandriX Orchestrator so that sessions started in one surface can continue in another.

Key capabilities:
- Inline edit suggestions with accept, reject, and modify controls
- Symbol-aware editing with cross-reference navigation and type-aware refactors
- Multi-file edits proposed as structured diffs before application
- Codebase chat with full project awareness from local index
- Commands palette integration: explain, refactor, test, document, commit message, PR draft
- Privacy controls for local codebase indexing
- Fast local-to-cloud sync so tasks continue in XandriX Studio or Terminal Agent seamlessly

### 5. XandriX Orchestrator

The central runtime for planning, routing, memory, approvals, tool usage, task state, and agent coordination. Every autonomous task in XandriX AI OS flows through the XandriX Orchestrator, which decomposes goals into sub-tasks, assigns work to specialist agents, manages shared context, enforces approval policies, handles retries and rollback, and exposes a live action timeline.

Key capabilities:
- Task decomposition from high-level goals into structured execution plans
- Agent routing based on task type and complexity
- Shared context and memory management across agents
- State machine workflow engine with pause, resume, cancel, and rollback
- Child-task spawning and merge-back for parallel execution
- Human approval gates with configurable risk-based policies
- Priority handling and concurrency control
- MCP-native tool integration for plugging in external systems
- Lazy tool loading to handle hundreds of tools without context bloat
- Deterministic lifecycle hooks (pre-edit, post-edit, pre-commit, pre-deploy, post-test)
- Replayable workflow traces for debugging and auditing

### 6. XandriX SecureOps

A strictly defensive, authorized security workflow layer. XandriX SecureOps handles vulnerability triage, secure code review, secrets scanning, dependency inspection, misconfiguration checks, policy enforcement, asset inventory enrichment, and remediation planning — with every action scoped, authorized, logged, and subject to human approval where required.

XandriX SecureOps does not include offensive intrusion, exploit automation, attack chains, persistence mechanisms, stealth workflows, unauthorized access, weaponization, or destructive operations.

Key capabilities:
- Automated secure code review with structured finding reports
- Dependency risk scanning and vulnerable package detection
- Secrets detection across source, config, and history
- Misconfiguration checks for infrastructure and deployment configs
- Policy validation against organization-defined rules
- Remediation recommendations with proposed code fixes
- Authorization metadata and scope enforcement on every workflow
- Audit logs for every finding, action, and approval
- Human approval gates before any remediation is applied

---

## Flagship Model Foundation

XandriX AI OS is built around a proprietary, highly intelligent, fine-tuned flagship AI model that serves as the primary cognitive core of the platform. This flagship model is not one model among many — it is the central reasoning, coding, planning, synthesis, debugging, and long-horizon execution engine that defines the quality, behavior, and identity of the platform.

### Layered Model Architecture

**1. Flagship Core Model**
- Highest reasoning quality
- Strongest coding ability
- Longest-horizon planning
- Best final-answer generation
- Best architectural synthesis
- Primary model for all important user-facing outputs

**2. Specialist Support Models**
- Coding acceleration variants
- Review and critique variants
- Summarization variants
- Memory compression variants
- Retrieval and routing models
- Low-latency assistant variants

**3. Utility Models**
- Embeddings
- Classifiers
- Policy checks
- Rerankers
- Tagging and telemetry helpers

The flagship model is always invoked for: final architecture generation, major code synthesis, multi-file refactors, failure diagnosis, deployment reasoning, difficult debugging, user-visible final outputs, and long-horizon task planning. Support models prepare context, filter candidates, summarize logs, and compress memory before handing off to the flagship model.

---

## State-of-the-Art Platform Capabilities

XandriX AI OS includes the following capabilities as first-class platform requirements:

1. **Parallel isolated task sandboxes** — each task runs in its own isolated environment so concurrent jobs do not contaminate one another.
2. **Worktree-based parallel development** — git worktree support for attempting multiple implementations in parallel and comparing outcomes.
3. **Hierarchical approval modes** — always ask, ask for high-risk only, auto-allow safe actions, environment-specific approvals, and organization policy overrides.
4. **Safe-by-default sandboxing** — commands run in constrained environments with blocked writes outside approved areas and blocked network access by default.
5. **MCP-native integration layer** — Model Context Protocol support for plugging external systems, data sources, and workflows into XandriX AI OS through a standard interface.
6. **Lazy tool loading and large-tool scalability** — dynamic tool loading so hundreds of tools can be available without pushing all definitions into context at once.
7. **Specialized subagents** — planner, coder, reviewer, debugger, test generator, documentation writer, infra generator, and repo explorer agents.
8. **Deterministic hooks and policy automations** — lifecycle hooks that run on pre-edit, post-edit, pre-commit, pre-deploy, post-test, approval request, and security finding creation events.
9. **Auto memory from user corrections** — the platform learns from corrections and stores reusable project guidance, conventions, and preferences automatically.
10. **Context compaction for long-running tasks** — compaction, summarization, checkpoint compression, and context refresh so agents can work far beyond a single context window.
11. **Goal-oriented evaluation harness** — evaluates both task-level correctness and developer-goal performance across multi-step repository work.
12. **PR-native workflow automation** — agents can create, review, comment on, and update pull requests, propose diffs, generate release notes, and act as a review signal inside Git workflows.
13. **CI-integrated agent actions** — repeatable non-interactive agent jobs in CI/CD for code review, migration checks, release prep, changelog drafting, docs updates, and regression triage.
14. **Branch risk review before merge** — review of a branch against its base to identify risky diffs, missing tests, migration issues, and documentation gaps before PR creation or merge.
15. **Symbol-aware code intelligence** — precise symbol navigation, cross-reference resolution, type-aware editing, and structural refactors.
16. **Multi-repo and dependency graph awareness** — understanding services, packages, libraries, APIs, infrastructure, and shared contracts across more than one repository.
17. **Repo-map and architecture-map generation** — automatic creation and maintenance of repo maps, service maps, dependency graphs, schema graphs, and architecture summaries.
18. **Failure-aware self-healing loops** — bounded repair loops with explicit retry strategies, checkpoint rollback, and escalation rules when tests fail or commands error.
19. **Environment-scoped internet access** — internet access controllable per environment, off by default where appropriate.
20. **Human-readable action timeline** — live timeline of reasoning state transitions, files touched, commands run, approvals requested, and outputs produced.
21. **Replayable workflow traces** — every task is replayable for debugging, audit, regression analysis, and eval generation.
22. **Child-task spawning and merge-back** — agents can split a large job into child tasks, run them in separate workspaces, and merge or compare results.
23. **Automated test and benchmark synthesis** — synthesizes missing tests, generates regression cases from failures, and adds them to an eval library.
24. **Quality-gated finalization** — no large code change is finalized until linting, tests, policy checks, secrets checks, and change-risk review pass.
25. **Model-and-tool eval observability** — tracks which model, context package, tools, and policies were used per task for quality regression analysis.
26. **Infrastructure-noise-aware evals** — benchmarking accounts for environment variance so agent improvements are not confused with infrastructure differences.
27. **Persistent project operating manuals** — structured instruction files per project defining norms, architecture assumptions, commands, test strategy, and agent behavior.
28. **Session continuation across surfaces** — a task started in XandriX Chat continues in Terminal Agent, Studio, editor extension, or cloud task runner without losing state.
29. **Review-before-apply diff mode** — agents propose edits as structured diffs for approval before applying them, especially for multi-file or risky changes.
30. **Security and policy guardrails as runtime** — risk controls live in sandboxing, approvals, hooks, policy engines, and audit systems — not merely in model instructions.

---

## Agent Runtime

XandriX AI OS includes the following specialist agents coordinated by the XandriX Orchestrator:

| Agent | Role | Default Model |
|---|---|---|
| **Planner Agent** | Decomposes goals into structured task graphs | Flagship |
| **Coder Agent** | Generates, edits, and refactors code across files | Flagship |
| **Reviewer Agent** | Reviews diffs, identifies issues, proposes fixes | Flagship |
| **Debugger Agent** | Diagnoses failures, traces errors, proposes repairs | Flagship |
| **Test Agent** | Generates tests, runs suites, synthesizes regression cases | Flagship |
| **File/Navigation Agent** | Reads, searches, and maps repositories | Support → escalates |
| **Deployment Assistant Agent** | Prepares and coordinates deployment workflows | Flagship |
| **Workspace Memory Agent** | Manages context, memory, and summarization | Support |
| **Secure Code Review Agent** | Runs defensive security analysis and findings | Flagship |

---

## Supported Languages and Frameworks

**Languages:** Python, TypeScript, JavaScript, Go, Rust, Java, C#, SQL, Bash

**Frameworks:** React, Next.js, Node.js, FastAPI, Django, Flask, Express, PostgreSQL, Redis, Docker

**Project types:** APIs, web apps, internal tools, dashboards, automation systems, microservices, CLIs, full-stack apps

---

## Monorepo Structure

```
xandrix-ai-os/
├── apps/
│   ├── web/                      # XandriX Chat (Next.js)
│   ├── studio/                   # XandriX Studio browser IDE (Next.js)
│   └── docs/                     # Documentation site
├── packages/
│   ├── xandrix-sdk/              # Shared TypeScript SDK
│   ├── xandrix-ui/               # Shared UI component library
│   └── xandrix-types/            # Shared type definitions
├── services/
│   ├── orchestrator/             # XandriX Orchestrator (task routing, state machine, approvals)
│   ├── agent-runtime/            # Agent execution runtime (planner, coder, reviewer, etc.)
│   ├── auth/                     # Authentication and authorization service
│   ├── memory/                   # Workspace memory and context service
│   ├── workspace/                # Workspace and file system service
│   ├── model-gateway/            # Flagship model routing and gateway
│   ├── deployment/               # Deployment workflow service
│   ├── secureops/                # XandriX SecureOps defensive security service
│   └── telemetry/                # Observability, tracing, and metrics service
├── plugins/
│   ├── vscode/                   # XandriX Code VS Code extension
│   └── jetbrains/                # XandriX Code JetBrains plugin
├── cli/                          # XandriX Terminal Agent CLI
├── infra/
│   ├── terraform/                # Infrastructure as code
│   ├── docker/                   # Container definitions
│   └── k8s/                      # Kubernetes manifests
├── db/
│   ├── migrations/               # Database schema migrations
│   └── seeds/                    # Seed data
└── docs/
    ├── SYSTEM_BLUEPRINT.md       # Full system specification
    ├── architecture/             # Architecture diagrams and decisions
    ├── api/                      # API reference documentation
    └── guides/                   # User and developer guides
```

---

## Build Roadmap

### Phase 0 — Architecture and Foundations
Goals: monorepo setup, shared types, auth service, model gateway skeleton, database schema.

### Phase 1 — XandriX Chat + Project Workspaces
Goals: working web chat UI, project creation, basic flagship model integration, session persistence.

### Phase 2 — XandriX Terminal Agent + File Editing
Goals: CLI with repo attach, file read/write tools, approval flow, resumable sessions, build/test loops.

### Phase 3 — XandriX Studio Browser IDE
Goals: browser IDE with file tree, editor, terminal pane, task sidebar, diff/review mode, and AI chat panel.

### Phase 4 — XandriX Code Editor Integrations
Goals: VS Code extension, codebase chat, inline suggestions, multi-file edits, local-to-cloud sync.

### Phase 5 — Multi-Agent Orchestration
Goals: full XandriX Orchestrator with task decomposition, child-task spawning, state machine, approvals, and replayable traces.

### Phase 6 — Deployment Workflows
Goals: preview deployments, staging, production deployment assistance, infra templates, CI/CD integration.

### Phase 7 — XandriX SecureOps
Goals: secure code review, dependency scanning, secrets detection, policy validation, remediation planning.

### Phase 8 — Scaling, Observability, and Hardening
Goals: distributed tracing, metrics dashboards, workflow replay, adversarial prompt testing, performance benchmarking, enterprise policy controls.

---

## Non-Negotiable Design Goals

XandriX AI OS is:
- **Private by design** — no training on user code or conversations without explicit consent.
- **Modular** — every surface and service is independently deployable and replaceable.
- **Production-grade** — built for real software projects, not demos.
- **Agentic but controllable** — agents operate autonomously within explicit approval policies.
- **Safe for enterprise and advanced solo use** — audit logs, role-based access, sandboxing, and policy enforcement at the runtime layer.
- **Resilient to long-running task failure** — checkpointing, rollback, and self-healing loops built in.
- **Transparent in actions** — every action is visible, logged, and replayable.
- **Extensible** — tools, plugins, runtimes, and new models can be added without platform changes.
