import express, { type Express } from 'express';
import { loadEnv } from './config.js';
import { createAuthRouter } from './routes/auth.js';

const env = loadEnv();
const app: Express = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'xandrix-auth', version: '0.0.1' });
});

// Auth routes
app.use('/auth', createAuthRouter(env));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`🔐 XandriX Auth service listening on port ${port}`);
});

export { app };
