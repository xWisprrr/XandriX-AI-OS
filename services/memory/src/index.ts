import express, { type Express } from 'express';
import { MemoryStore } from './MemoryStore.js';
import { createMemoryRouter } from './routes/memory.js';

const PORT = parseInt(process.env['PORT'] ?? '3004', 10);
const app: Express = express();
app.use(express.json());

const store = new MemoryStore();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'xandrix-memory', version: '0.0.1' });
});

app.use('/', createMemoryRouter(store));

app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🧠 XandriX Memory service listening on port ${PORT}`);
});

export { app };
