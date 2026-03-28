import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { MemoryStore } from '../MemoryStore.js';

const upsertSchema = z.object({
  workspaceId: z.string().uuid(),
  kind: z.enum(['project_convention', 'user_preference', 'architecture_note', 'error_pattern', 'approved_tool']),
  key: z.string().min(1),
  value: z.string().min(1),
  source: z.enum(['agent', 'user', 'system']),
  confidence: z.number().min(0).max(1).optional(),
});

export function createMemoryRouter(store: MemoryStore): Router {
  const router = Router();

  router.post('/memory', (req: Request, res: Response): void => {
    const parse = upsertSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    const entry = store.upsert(parse.data);
    res.status(201).json({ data: entry });
  });

  router.get('/memory', (req: Request, res: Response): void => {
    const workspaceId = req.query['workspaceId'] as string;
    const kind = req.query['kind'] as string | undefined;
    const query = req.query['q'] as string | undefined;
    if (!workspaceId) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'workspaceId is required' });
      return;
    }
    const entries = query
      ? store.search(workspaceId, query)
      : store.list(workspaceId, kind as Parameters<MemoryStore['list']>[1]);
    res.json({ data: entries });
  });

  router.get('/memory/:id', (req: Request, res: Response): void => {
    const entry = store.get(String(req.params['id'] ?? ''));
    if (!entry) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Memory entry not found' });
      return;
    }
    res.json({ data: entry });
  });

  router.delete('/memory/:id', (req: Request, res: Response): void => {
    const deleted = store.delete(String(req.params['id'] ?? ''));
    if (!deleted) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Memory entry not found' });
      return;
    }
    res.json({ data: { ok: true } });
  });

  return router;
}
