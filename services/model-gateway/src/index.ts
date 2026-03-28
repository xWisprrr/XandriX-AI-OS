import express, { type Express } from 'express';
import { env } from './config.js';
import { ModelRouter } from './router.js';
import { StubProvider } from './providers/stub.js';
import { createGatewayRouter } from './routes/gateway.js';

const app: Express = express();
app.use(express.json());

// Wire up the model router
const modelRouter = new ModelRouter();
modelRouter.registerProvider(new StubProvider());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'xandrix-model-gateway', version: '0.0.1' });
});

// Gateway routes
app.use('/', createGatewayRouter(modelRouter));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`🤖 XandriX Model Gateway listening on port ${port} (provider: ${env.PROVIDER})`);
});

export { app };
