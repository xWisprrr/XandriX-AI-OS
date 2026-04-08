import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRegistry } from '../state/TaskRegistry.js';

describe('TaskRegistry', () => {
  let registry: TaskRegistry;
  const sessionId = crypto.randomUUID();

  beforeEach(() => {
    registry = new TaskRegistry();
  });

  // ── createTask ────────────────────────────────────────────────────────────

  describe('createTask', () => {
    it('creates a task with default pending status and normal priority', () => {
      const task = registry.createTask({ goal: 'Build a REST API', sessionId });
      expect(task.id).toBeTruthy();
      expect(task.goal).toBe('Build a REST API');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('normal');
      expect(task.planSteps).toEqual([]);
      expect(task.childTaskIds).toEqual([]);
      expect(task.parentId).toBeNull();
      expect(task.assignedAgentId).toBeNull();
      expect(task.completedAt).toBeNull();
    });

    it('accepts custom priority', () => {
      const task = registry.createTask({ goal: 'Critical fix', sessionId, priority: 'critical' });
      expect(task.priority).toBe('critical');
    });

    it('links child task to parent and adds to parent.childTaskIds', () => {
      const parent = registry.createTask({ goal: 'Parent task', sessionId });
      const child = registry.createTask({ goal: 'Child task', sessionId, parentId: parent.id });
      expect(child.parentId).toBe(parent.id);
      const updatedParent = registry.getTask(parent.id);
      expect(updatedParent?.childTaskIds).toContain(child.id);
    });

    it('uses default approval policy with high_risk_only mode', () => {
      const task = registry.createTask({ goal: 'Any goal', sessionId });
      expect(task.approvalPolicy.mode).toBe('high_risk_only');
    });
  });

  // ── getTask ───────────────────────────────────────────────────────────────

  describe('getTask', () => {
    it('returns a task by id', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      expect(registry.getTask(task.id)).toEqual(task);
    });

    it('returns undefined for an unknown id', () => {
      expect(registry.getTask('unknown-id')).toBeUndefined();
    });
  });

  // ── listTasks ─────────────────────────────────────────────────────────────

  describe('listTasks', () => {
    it('returns all tasks when no sessionId filter', () => {
      const sid2 = crypto.randomUUID();
      registry.createTask({ goal: 'Task A', sessionId });
      registry.createTask({ goal: 'Task B', sessionId: sid2 });
      expect(registry.listTasks()).toHaveLength(2);
    });

    it('returns empty array when registry is empty', () => {
      expect(registry.listTasks()).toHaveLength(0);
    });

    it('filters tasks by sessionId', () => {
      const sid2 = crypto.randomUUID();
      registry.createTask({ goal: 'Task A', sessionId });
      registry.createTask({ goal: 'Task B', sessionId: sid2 });
      const filtered = registry.listTasks(sessionId);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.goal).toBe('Task A');
    });
  });

  // ── updateStatus ──────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('transitions task to running status', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const updated = registry.updateStatus(task.id, 'running');
      expect(updated?.status).toBe('running');
    });

    it('sets completedAt when task reaches completed status', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const updated = registry.updateStatus(task.id, 'completed');
      expect(updated?.completedAt).toBeTruthy();
    });

    it('sets completedAt when task fails', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const updated = registry.updateStatus(task.id, 'failed');
      expect(updated?.completedAt).toBeTruthy();
    });

    it('sets completedAt when task is cancelled', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const updated = registry.updateStatus(task.id, 'cancelled');
      expect(updated?.completedAt).toBeTruthy();
    });

    it('does not set completedAt for non-terminal status', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const updated = registry.updateStatus(task.id, 'running');
      expect(updated?.completedAt).toBeNull();
    });

    it('returns undefined for an unknown task id', () => {
      expect(registry.updateStatus('unknown-id', 'completed')).toBeUndefined();
    });
  });

  // ── assignAgent ───────────────────────────────────────────────────────────

  describe('assignAgent', () => {
    it('assigns an agent to a task', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const agentId = crypto.randomUUID();
      const updated = registry.assignAgent(task.id, agentId);
      expect(updated?.assignedAgentId).toBe(agentId);
    });

    it('returns undefined for unknown task id', () => {
      expect(registry.assignAgent('unknown', crypto.randomUUID())).toBeUndefined();
    });
  });

  // ── approvals ─────────────────────────────────────────────────────────────

  describe('approvals', () => {
    it('creates a pending approval request', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const agentId = crypto.randomUUID();
      const approval = registry.createApproval({
        taskId: task.id,
        agentId,
        action: 'shell_command',
        description: 'Run npm install',
        riskLevel: 'medium',
        payload: { command: 'npm install' },
      });
      expect(approval.id).toBeTruthy();
      expect(approval.status).toBe('pending');
      expect(approval.resolvedAt).toBeNull();
      expect(approval.resolvedBy).toBeNull();
    });

    it('resolves an approval as approved', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const approval = registry.createApproval({
        taskId: task.id,
        agentId: crypto.randomUUID(),
        action: 'file_write',
        description: 'Write config',
        riskLevel: 'low',
        payload: {},
      });
      const resolved = registry.resolveApproval(approval.id, 'approved', 'admin-user-id');
      expect(resolved?.status).toBe('approved');
      expect(resolved?.resolvedBy).toBe('admin-user-id');
      expect(resolved?.resolvedAt).toBeTruthy();
    });

    it('resolves an approval as rejected', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const approval = registry.createApproval({
        taskId: task.id,
        agentId: crypto.randomUUID(),
        action: 'shell_command',
        description: 'Run rm -rf',
        riskLevel: 'critical',
        payload: {},
      });
      const resolved = registry.resolveApproval(approval.id, 'rejected', 'admin-user-id');
      expect(resolved?.status).toBe('rejected');
    });

    it('returns undefined when trying to resolve an already-resolved approval', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const approval = registry.createApproval({
        taskId: task.id,
        agentId: crypto.randomUUID(),
        action: 'file_read',
        description: 'Read file',
        riskLevel: 'safe',
        payload: {},
      });
      registry.resolveApproval(approval.id, 'approved', 'user-1');
      const second = registry.resolveApproval(approval.id, 'rejected', 'user-2');
      expect(second).toBeUndefined();
    });

    it('listPendingApprovals returns only pending entries', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const agentId = crypto.randomUUID();
      const a1 = registry.createApproval({
        taskId: task.id, agentId, action: 'a', description: 'd', riskLevel: 'low', payload: {},
      });
      const a2 = registry.createApproval({
        taskId: task.id, agentId, action: 'b', description: 'd', riskLevel: 'medium', payload: {},
      });
      registry.resolveApproval(a1.id, 'approved', 'user-1');
      const pending = registry.listPendingApprovals();
      expect(pending).toHaveLength(1);
      expect(pending[0]!.id).toBe(a2.id);
    });

    it('listPendingApprovals filters by taskId', () => {
      const t1 = registry.createTask({ goal: 'Task 1', sessionId });
      const t2 = registry.createTask({ goal: 'Task 2', sessionId });
      const agentId = crypto.randomUUID();
      registry.createApproval({
        taskId: t1.id, agentId, action: 'a', description: 'd', riskLevel: 'low', payload: {},
      });
      registry.createApproval({
        taskId: t2.id, agentId, action: 'b', description: 'd', riskLevel: 'high', payload: {},
      });
      const t1Pending = registry.listPendingApprovals(t1.id);
      expect(t1Pending).toHaveLength(1);
      expect(t1Pending[0]!.taskId).toBe(t1.id);
    });
  });

  // ── timeline ──────────────────────────────────────────────────────────────

  describe('timeline', () => {
    it('records an event and retrieves it', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const agentId = crypto.randomUUID();
      registry.recordEvent({
        taskId: task.id,
        agentId,
        kind: 'task_created',
        summary: 'Task was created',
        payload: {},
        riskLevel: 'safe',
      });
      const timeline = registry.getTimeline(task.id);
      expect(timeline).toHaveLength(1);
      expect(timeline[0]!.kind).toBe('task_created');
      expect(timeline[0]!.id).toBeTruthy();
      expect(timeline[0]!.createdAt).toBeTruthy();
    });

    it('returns events in insertion order', () => {
      const task = registry.createTask({ goal: 'Test', sessionId });
      const agentId = crypto.randomUUID();
      const base = { taskId: task.id, agentId, payload: {}, riskLevel: 'safe' as const, summary: '' };
      registry.recordEvent({ ...base, kind: 'agent_started' });
      registry.recordEvent({ ...base, kind: 'tool_call' });
      registry.recordEvent({ ...base, kind: 'task_completed' });
      const timeline = registry.getTimeline(task.id);
      expect(timeline[0]!.kind).toBe('agent_started');
      expect(timeline[1]!.kind).toBe('tool_call');
      expect(timeline[2]!.kind).toBe('task_completed');
    });

    it('returns empty array for an unknown task id', () => {
      expect(registry.getTimeline('unknown-task-id')).toEqual([]);
    });
  });
});
