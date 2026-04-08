import { describe, it, expect, beforeEach } from 'vitest';
import { AgentPool } from '../agents/AgentPool.js';

describe('AgentPool', () => {
  let pool: AgentPool;
  const sessionId = crypto.randomUUID();

  beforeEach(() => {
    pool = new AgentPool();
  });

  describe('spawn', () => {
    it('spawns an agent with idle status and null taskId', () => {
      const agent = pool.spawn({ role: 'coder', modelId: 'xandrix-flagship-v1', sessionId });
      expect(agent.id).toBeTruthy();
      expect(agent.role).toBe('coder');
      expect(agent.status).toBe('idle');
      expect(agent.modelId).toBe('xandrix-flagship-v1');
      expect(agent.sessionId).toBe(sessionId);
      expect(agent.taskId).toBeNull();
      expect(agent.createdAt).toBeTruthy();
      expect(agent.updatedAt).toBeTruthy();
    });

    it('assigns a taskId when provided', () => {
      const taskId = crypto.randomUUID();
      const agent = pool.spawn({ role: 'planner', modelId: 'm', sessionId, taskId });
      expect(agent.taskId).toBe(taskId);
    });

    it('spawns multiple agents with unique ids', () => {
      const a1 = pool.spawn({ role: 'coder', modelId: 'm', sessionId });
      const a2 = pool.spawn({ role: 'reviewer', modelId: 'm', sessionId });
      expect(a1.id).not.toBe(a2.id);
    });
  });

  describe('get', () => {
    it('returns an agent by id', () => {
      const agent = pool.spawn({ role: 'debugger', modelId: 'm', sessionId });
      expect(pool.get(agent.id)).toEqual(agent);
    });

    it('returns undefined for unknown id', () => {
      expect(pool.get('unknown-id')).toBeUndefined();
    });
  });

  describe('list', () => {
    it('returns all agents when no sessionId filter', () => {
      const sid2 = crypto.randomUUID();
      pool.spawn({ role: 'planner', modelId: 'm', sessionId });
      pool.spawn({ role: 'coder', modelId: 'm', sessionId: sid2 });
      expect(pool.list()).toHaveLength(2);
    });

    it('returns empty array when pool is empty', () => {
      expect(pool.list()).toHaveLength(0);
    });

    it('filters agents by sessionId', () => {
      const sid2 = crypto.randomUUID();
      pool.spawn({ role: 'planner', modelId: 'm', sessionId });
      pool.spawn({ role: 'coder', modelId: 'm', sessionId: sid2 });
      const filtered = pool.list(sessionId);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.role).toBe('planner');
    });
  });

  describe('setStatus', () => {
    it('updates agent status', () => {
      const agent = pool.spawn({ role: 'test', modelId: 'm', sessionId });
      const updated = pool.setStatus(agent.id, 'running');
      expect(updated?.status).toBe('running');
    });

    it('updates the updatedAt timestamp', () => {
      const agent = pool.spawn({ role: 'test', modelId: 'm', sessionId });
      const updated = pool.setStatus(agent.id, 'paused');
      expect(updated?.updatedAt).toBeTruthy();
    });

    it('returns undefined for unknown agent id', () => {
      expect(pool.setStatus('unknown-id', 'running')).toBeUndefined();
    });
  });

  describe('assignTask', () => {
    it('assigns a task and sets status to running', () => {
      const agent = pool.spawn({ role: 'coder', modelId: 'm', sessionId });
      const taskId = crypto.randomUUID();
      const updated = pool.assignTask(agent.id, taskId);
      expect(updated?.taskId).toBe(taskId);
      expect(updated?.status).toBe('running');
    });

    it('returns undefined for unknown agent id', () => {
      expect(pool.assignTask('unknown-id', crypto.randomUUID())).toBeUndefined();
    });
  });

  describe('findIdle', () => {
    it('finds an idle agent by role', () => {
      const agent = pool.spawn({ role: 'navigator', modelId: 'm', sessionId });
      const found = pool.findIdle('navigator');
      expect(found?.id).toBe(agent.id);
    });

    it('returns undefined when no idle agent exists for the role', () => {
      const agent = pool.spawn({ role: 'secureops', modelId: 'm', sessionId });
      pool.setStatus(agent.id, 'running');
      expect(pool.findIdle('secureops')).toBeUndefined();
    });

    it('returns undefined when no agent exists for the role', () => {
      expect(pool.findIdle('deployment')).toBeUndefined();
    });
  });

  describe('terminate', () => {
    it('sets agent status to cancelled', () => {
      const agent = pool.spawn({ role: 'memory', modelId: 'm', sessionId });
      const terminated = pool.terminate(agent.id);
      expect(terminated?.status).toBe('cancelled');
    });

    it('returns undefined for unknown agent id', () => {
      expect(pool.terminate('unknown-id')).toBeUndefined();
    });
  });
});
