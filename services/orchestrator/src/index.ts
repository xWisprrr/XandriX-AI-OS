import express, { type Express } from 'express';
import { z } from 'zod';
import { TaskRegistry } from './state/TaskRegistry.js';
import { AgentPool } from './agents/AgentPool.js';
import { createOrchestratorRouter } from './routes/orchestrator.js';

const envSchema = z.object({
  PORT: z.string().default('3003'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const env = (() => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid env:', result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
})();

const app: Express = express();
app.use(express.json());

const registry = new TaskRegistry();
const pool = new AgentPool();

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'xandrix-orchestrator',
    version: '0.0.1',
    tasks: registry.listTasks().length,
    agents: pool.list().length,
  });
});

// Orchestrator API
app.use('/', createOrchestratorRouter(registry, pool));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`🎯 XandriX Orchestrator listening on port ${port}`);
});

export { app, registry, pool };
