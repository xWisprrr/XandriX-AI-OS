import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { TaskRegistry } from '../state/TaskRegistry.js';
import type { AgentPool } from '../agents/AgentPool.js';

const createTaskSchema = z.object({
  goal: z.string().min(1),
  sessionId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
});

const approvalDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  resolvedBy: z.string().uuid(),
});

export function createOrchestratorRouter(registry: TaskRegistry, pool: AgentPool): Router {
  const router = Router();

  // ── Tasks ────────────────────────────────────────────────────────────────

  router.post('/tasks', (req: Request, res: Response): void => {
    const parse = createTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    const task = registry.createTask(parse.data);
    res.status(201).json({ data: task });
  });

  router.get('/tasks', (req: Request, res: Response): void => {
    const sessionId = req.query['sessionId'] as string | undefined;
    res.json({ data: registry.listTasks(sessionId) });
  });

  router.get('/tasks/:id', (req: Request, res: Response): void => {
    const task = registry.getTask(String(req.params['id'] ?? ''));
    if (!task) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found' });
      return;
    }
    res.json({ data: task });
  });

  router.patch('/tasks/:id/status', (req: Request, res: Response): void => {
    const schema = z.object({ status: z.enum(['paused', 'cancelled', 'running']) });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    const task = registry.updateStatus(String(req.params['id'] ?? ''), parse.data.status);
    if (!task) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found' });
      return;
    }
    res.json({ data: task });
  });

  // ── Timeline ─────────────────────────────────────────────────────────────

  router.get('/tasks/:id/timeline', (req: Request, res: Response): void => {
    const task = registry.getTask(String(req.params['id'] ?? ''));
    if (!task) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found' });
      return;
    }
    res.json({ data: registry.getTimeline(String(req.params['id'] ?? '')) });
  });

  // ── Approvals ────────────────────────────────────────────────────────────

  router.get('/approvals', (req: Request, res: Response): void => {
    const taskId = req.query['taskId'] as string | undefined;
    res.json({ data: registry.listPendingApprovals(taskId) });
  });

  router.patch('/approvals/:id', (req: Request, res: Response): void => {
    const parse = approvalDecisionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    const approval = registry.resolveApproval(
      String(req.params['id'] ?? ''),
      parse.data.decision,
      parse.data.resolvedBy,
    );
    if (!approval) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Approval not found or already resolved' });
      return;
    }
    res.json({ data: approval });
  });

  // ── Agents ────────────────────────────────────────────────────────────────

  router.post('/agents', (req: Request, res: Response): void => {
    const schema = z.object({
      role: z.enum(['planner', 'coder', 'reviewer', 'debugger', 'test', 'navigator', 'deployment', 'memory', 'secureops']),
      modelId: z.string(),
      sessionId: z.string().uuid(),
      taskId: z.string().uuid().optional(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    const agent = pool.spawn(parse.data);
    res.status(201).json({ data: agent });
  });

  router.get('/agents', (req: Request, res: Response): void => {
    const sessionId = req.query['sessionId'] as string | undefined;
    res.json({ data: pool.list(sessionId) });
  });

  return router;
}
