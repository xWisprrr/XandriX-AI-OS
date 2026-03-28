// ─── Core domain types for XandriX AI OS ────────────────────────────────────

export type ID = string;
export type ISOTimestamp = string;

// ─── Models ──────────────────────────────────────────────────────────────────

export type ModelTier = 'flagship' | 'specialist' | 'utility';

export interface Model {
  id: ID;
  name: string;
  tier: ModelTier;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
}

// ─── Agents ──────────────────────────────────────────────────────────────────

export type AgentRole =
  | 'planner'
  | 'coder'
  | 'reviewer'
  | 'debugger'
  | 'test'
  | 'navigator'
  | 'deployment'
  | 'memory'
  | 'secureops';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface Agent {
  id: ID;
  role: AgentRole;
  status: AgentStatus;
  modelId: ID;
  sessionId: ID;
  taskId: ID | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskStatus =
  | 'pending'
  | 'planning'
  | 'running'
  | 'awaiting_approval'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';

export type TaskPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Task {
  id: ID;
  parentId: ID | null;
  sessionId: ID;
  goal: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId: ID | null;
  childTaskIds: ID[];
  planSteps: PlanStep[];
  approvalPolicy: ApprovalPolicy;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  completedAt: ISOTimestamp | null;
}

export interface PlanStep {
  id: ID;
  index: number;
  description: string;
  toolName: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result: unknown | null;
  startedAt: ISOTimestamp | null;
  completedAt: ISOTimestamp | null;
}

// ─── Approvals ───────────────────────────────────────────────────────────────

export type ApprovalMode = 'always' | 'high_risk_only' | 'auto_safe';

export type ApprovalPolicy = {
  mode: ApprovalMode;
  allowedTools: string[] | '*';
  blockedTools: string[];
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

export interface ApprovalRequest {
  id: ID;
  taskId: ID;
  agentId: ID;
  action: string;
  description: string;
  riskLevel: RiskLevel;
  payload: unknown;
  status: ApprovalStatus;
  requestedAt: ISOTimestamp;
  resolvedAt: ISOTimestamp | null;
  resolvedBy: ID | null;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export type SessionSurface = 'chat' | 'terminal' | 'studio' | 'vscode' | 'jetbrains' | 'api';

export interface Session {
  id: ID;
  userId: ID;
  workspaceId: ID;
  surface: SessionSurface;
  activeTaskId: ID | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  expiresAt: ISOTimestamp | null;
}

// ─── Workspaces ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: ID;
  ownerId: ID;
  name: string;
  repoUrl: string | null;
  repoBranch: string | null;
  localPath: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Memory ───────────────────────────────────────────────────────────────────

export type MemoryKind =
  | 'project_convention'
  | 'user_preference'
  | 'architecture_note'
  | 'error_pattern'
  | 'approved_tool';

export interface MemoryEntry {
  id: ID;
  workspaceId: ID;
  kind: MemoryKind;
  key: string;
  value: string;
  source: 'agent' | 'user' | 'system';
  confidence: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: ID;
  sessionId: ID;
  taskId: ID | null;
  role: MessageRole;
  content: string;
  toolName: string | null;
  toolCallId: string | null;
  createdAt: ISOTimestamp;
}

// ─── Action Timeline ──────────────────────────────────────────────────────────

export type ActionKind =
  | 'tool_call'
  | 'file_read'
  | 'file_write'
  | 'shell_command'
  | 'approval_requested'
  | 'approval_resolved'
  | 'task_created'
  | 'task_completed'
  | 'task_failed'
  | 'memory_stored'
  | 'agent_started'
  | 'agent_stopped';

export interface ActionEvent {
  id: ID;
  taskId: ID;
  agentId: ID;
  kind: ActionKind;
  summary: string;
  payload: unknown;
  riskLevel: RiskLevel;
  createdAt: ISOTimestamp;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: ID;
  email: string;
  name: string;
  role: UserRole;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  riskLevel: RiskLevel;
  category: 'filesystem' | 'shell' | 'git' | 'web' | 'database' | 'api' | 'memory';
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export type DeploymentEnvironment = 'preview' | 'staging' | 'production';
export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'live' | 'failed' | 'rolled_back';

export interface Deployment {
  id: ID;
  workspaceId: ID;
  taskId: ID | null;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  url: string | null;
  commit: string | null;
  branch: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── SecureOps ────────────────────────────────────────────────────────────────

export type FindingKind =
  | 'vulnerability'
  | 'secret'
  | 'misconfiguration'
  | 'policy_violation'
  | 'dependency_risk';

export type FindingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface SecurityFinding {
  id: ID;
  workspaceId: ID;
  taskId: ID | null;
  kind: FindingKind;
  severity: FindingSeverity;
  title: string;
  description: string;
  filePath: string | null;
  lineNumber: number | null;
  remediation: string | null;
  status: 'open' | 'remediated' | 'accepted' | 'false_positive';
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}
