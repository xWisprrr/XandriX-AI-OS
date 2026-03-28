import { Router, type Request, type Response } from 'express';
import type { ModelRouter } from '../router.js';
import { z } from 'zod';

const completionSchema = z.object({
  modelId: z.string(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
  stream: z.boolean().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export function createGatewayRouter(modelRouter: ModelRouter): Router {
  const router = Router();

  // GET /models — list all available models
  router.get('/models', (_req: Request, res: Response): void => {
    res.json({ data: modelRouter.listModels() });
  });

  // POST /complete — non-streaming completion
  router.post('/complete', async (req: Request, res: Response): Promise<void> => {
    const parse = completionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    try {
      const response = await modelRouter.complete(parse.data);
      res.json({ data: response });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ code: 'COMPLETION_ERROR', message });
    }
  });

  // POST /stream — streaming completion via SSE
  router.post('/stream', async (req: Request, res: Response): Promise<void> => {
    const parse = completionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', details: parse.error.flatten() });
      return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    try {
      for await (const chunk of modelRouter.stream({ ...parse.data, stream: true })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  });

  return router;
}
