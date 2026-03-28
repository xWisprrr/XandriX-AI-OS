-- XandriX AI OS — Initial Schema Migration
-- Phase 0: Core tables for auth, workspaces, tasks, agents, memory, timeline

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Refresh Tokens ──────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Workspaces ──────────────────────────────────────────────────────────────
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  repo_url    TEXT,
  repo_branch TEXT,
  local_path  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Sessions ─────────────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  surface       TEXT NOT NULL CHECK (surface IN ('chat', 'terminal', 'studio', 'vscode', 'jetbrains', 'api')),
  active_task_id UUID,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_id        UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  goal              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','planning','running','awaiting_approval','paused','completed','failed','cancelled','rolled_back')),
  priority          TEXT NOT NULL DEFAULT 'normal'
                      CHECK (priority IN ('low','normal','high','critical')),
  assigned_agent_id UUID,
  plan_steps        JSONB NOT NULL DEFAULT '[]',
  approval_policy   JSONB NOT NULL DEFAULT '{"mode":"high_risk_only","allowedTools":"*","blockedTools":[]}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

-- ─── Agents ───────────────────────────────────────────────────────────────────
CREATE TABLE agents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT NOT NULL CHECK (role IN ('planner','coder','reviewer','debugger','test','navigator','deployment','memory','secureops')),
  status      TEXT NOT NULL DEFAULT 'idle'
                CHECK (status IN ('idle','running','paused','completed','failed','cancelled')),
  model_id    TEXT NOT NULL,
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  task_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from tasks to agents after agents table exists
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_agent FOREIGN KEY (assigned_agent_id)
  REFERENCES agents(id) ON DELETE SET NULL;

ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_task FOREIGN KEY (active_task_id)
  REFERENCES tasks(id) ON DELETE SET NULL;

-- ─── Approval Requests ────────────────────────────────────────────────────────
CREATE TABLE approval_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id      UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  description   TEXT NOT NULL,
  risk_level    TEXT NOT NULL CHECK (risk_level IN ('safe','low','medium','high','critical')),
  payload       JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Action Timeline ─────────────────────────────────────────────────────────
CREATE TABLE action_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN (
                'tool_call','file_read','file_write','shell_command',
                'approval_requested','approval_resolved',
                'task_created','task_completed','task_failed',
                'memory_stored','agent_started','agent_stopped')),
  summary     TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}',
  risk_level  TEXT NOT NULL CHECK (risk_level IN ('safe','low','medium','high','critical')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  role          TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content       TEXT NOT NULL,
  tool_name     TEXT,
  tool_call_id  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Memory ───────────────────────────────────────────────────────────────────
CREATE TABLE memory_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('project_convention','user_preference','architecture_note','error_pattern','approved_tool')),
  key           TEXT NOT NULL,
  value         TEXT NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('agent','user','system')),
  confidence    FLOAT NOT NULL DEFAULT 1.0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, kind, key)
);

-- ─── Deployments ─────────────────────────────────────────────────────────────
CREATE TABLE deployments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  environment   TEXT NOT NULL CHECK (environment IN ('preview','staging','production')),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','building','deploying','live','failed','rolled_back')),
  url           TEXT,
  commit        TEXT,
  branch        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Security Findings ───────────────────────────────────────────────────────
CREATE TABLE security_findings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('vulnerability','secret','misconfiguration','policy_violation','dependency_risk')),
  severity      TEXT NOT NULL CHECK (severity IN ('info','low','medium','high','critical')),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  file_path     TEXT,
  line_number   INT,
  remediation   TEXT,
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','remediated','accepted','false_positive')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_tasks_session_id       ON tasks(session_id);
CREATE INDEX idx_tasks_parent_id        ON tasks(parent_id);
CREATE INDEX idx_tasks_status           ON tasks(status);
CREATE INDEX idx_agents_session_id      ON agents(session_id);
CREATE INDEX idx_agents_task_id         ON agents(task_id);
CREATE INDEX idx_action_events_task_id  ON action_events(task_id);
CREATE INDEX idx_messages_session_id    ON messages(session_id);
CREATE INDEX idx_memory_workspace_id    ON memory_entries(workspace_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
