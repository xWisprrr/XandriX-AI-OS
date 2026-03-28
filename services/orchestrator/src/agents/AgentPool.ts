import type { Agent, AgentRole, AgentStatus } from '@xandrix/types';

/**
 * Agent pool — manages registered agent instances and their lifecycle.
 * In production this coordinates with the agent-runtime service.
 */
export class AgentPool {
  private agents = new Map<string, Agent>();

  spawn(params: { role: AgentRole; modelId: string; sessionId: string; taskId?: string }): Agent {
    const now = new Date().toISOString();
    const agent: Agent = {
      id: crypto.randomUUID(),
      role: params.role,
      status: 'idle',
      modelId: params.modelId,
      sessionId: params.sessionId,
      taskId: params.taskId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(agent.id, agent);
    return agent;
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  list(sessionId?: string): Agent[] {
    const all = Array.from(this.agents.values());
    return sessionId ? all.filter((a) => a.sessionId === sessionId) : all;
  }

  setStatus(id: string, status: AgentStatus): Agent | undefined {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    agent.status = status;
    agent.updatedAt = new Date().toISOString();
    return agent;
  }

  assignTask(agentId: string, taskId: string): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;
    agent.taskId = taskId;
    agent.status = 'running';
    agent.updatedAt = new Date().toISOString();
    return agent;
  }

  /**
   * Find an idle agent with the given role, or return undefined if none available.
   */
  findIdle(role: AgentRole): Agent | undefined {
    return Array.from(this.agents.values()).find((a) => a.role === role && a.status === 'idle');
  }

  terminate(id: string): Agent | undefined {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    agent.status = 'cancelled';
    agent.updatedAt = new Date().toISOString();
    return agent;
  }
}
