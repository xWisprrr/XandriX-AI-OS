import type { Task, TaskStatus, ApprovalRequest, ActionEvent, AgentRole } from '@xandrix/types';

/**
 * In-memory task registry for the orchestrator.
 * In production this is backed by the database, but this in-memory
 * implementation is used for local development and testing.
 */
export class TaskRegistry {
  private tasks = new Map<string, Task>();
  private approvals = new Map<string, ApprovalRequest>();
  private timeline = new Map<string, ActionEvent[]>();

  // ── Tasks ──────────────────────────────────────────────────────────────────

  createTask(params: {
    goal: string;
    sessionId: string;
    parentId?: string;
    priority?: Task['priority'];
  }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      parentId: params.parentId ?? null,
      sessionId: params.sessionId,
      goal: params.goal,
      status: 'pending',
      priority: params.priority ?? 'normal',
      assignedAgentId: null,
      childTaskIds: [],
      planSteps: [],
      approvalPolicy: { mode: 'high_risk_only', allowedTools: '*', blockedTools: [] },
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    this.tasks.set(task.id, task);
    this.timeline.set(task.id, []);

    // Wire up parent → child relationship
    if (params.parentId) {
      const parent = this.tasks.get(params.parentId);
      if (parent) {
        parent.childTaskIds.push(task.id);
        parent.updatedAt = now;
      }
    }
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  listTasks(sessionId?: string): Task[] {
    const all = Array.from(this.tasks.values());
    return sessionId ? all.filter((t) => t.sessionId === sessionId) : all;
  }

  updateStatus(id: string, status: TaskStatus): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      task.completedAt = task.updatedAt;
    }
    return task;
  }

  assignAgent(taskId: string, agentId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    task.assignedAgentId = agentId;
    task.updatedAt = new Date().toISOString();
    return task;
  }

  // ── Approvals ──────────────────────────────────────────────────────────────

  createApproval(params: Omit<ApprovalRequest, 'id' | 'status' | 'requestedAt' | 'resolvedAt' | 'resolvedBy'>): ApprovalRequest {
    const approval: ApprovalRequest = {
      id: crypto.randomUUID(),
      ...params,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
    };
    this.approvals.set(approval.id, approval);
    return approval;
  }

  resolveApproval(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy: string,
  ): ApprovalRequest | undefined {
    const approval = this.approvals.get(id);
    if (!approval || approval.status !== 'pending') return undefined;
    approval.status = decision;
    approval.resolvedAt = new Date().toISOString();
    approval.resolvedBy = resolvedBy;
    return approval;
  }

  listPendingApprovals(taskId?: string): ApprovalRequest[] {
    const all = Array.from(this.approvals.values()).filter((a) => a.status === 'pending');
    return taskId ? all.filter((a) => a.taskId === taskId) : all;
  }

  // ── Timeline ───────────────────────────────────────────────────────────────

  recordEvent(event: Omit<ActionEvent, 'id' | 'createdAt'>): ActionEvent {
    const full: ActionEvent = {
      id: crypto.randomUUID(),
      ...event,
      createdAt: new Date().toISOString(),
    };
    const events = this.timeline.get(event.taskId) ?? [];
    events.push(full);
    this.timeline.set(event.taskId, events);
    return full;
  }

  getTimeline(taskId: string): ActionEvent[] {
    return this.timeline.get(taskId) ?? [];
  }
}
