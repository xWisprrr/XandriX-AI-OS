import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { createTokenPair, verifyRefreshToken } from '../jwt.js';
import type { Env } from '../config.js';

export function createAuthRouter(env: Env): Router {
  const router = Router();

  // Rate limiter: max 10 auth attempts per IP per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
  });

  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(12),
    name: z.string().min(1),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const refreshSchema = z.object({
    refreshToken: z.string(),
  });

  // POST /auth/register
  router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parse.error.flatten() });
      return;
    }
    // TODO: persist user to database — placeholder response for scaffold
    const { email, name } = parse.data;
    const id = crypto.randomUUID();
    const tokens = createTokenPair(
      { id, email, role: 'member' },
      env.JWT_SECRET,
      env.JWT_REFRESH_SECRET,
      env.JWT_ACCESS_EXPIRES_IN,
      env.JWT_REFRESH_EXPIRES_IN,
    );
    res.status(201).json({ data: { user: { id, email, name, role: 'member' }, tokens } });
  });

  // POST /auth/login
  router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parse.error.flatten() });
      return;
    }
    // TODO: look up user from database and verify password hash
    // Placeholder — always returns 401 until DB is wired
    res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  });

  // POST /auth/refresh
  router.post('/refresh', authLimiter, async (req: Request, res: Response): Promise<void> => {
    const parse = refreshSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parse.error.flatten() });
      return;
    }
    try {
      const payload = verifyRefreshToken(parse.data.refreshToken, env.JWT_REFRESH_SECRET);
      if (payload.type !== 'refresh') {
        res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid token type' });
        return;
      }
      const tokens = createTokenPair(
        { id: payload.sub, email: payload.email, role: payload.role },
        env.JWT_SECRET,
        env.JWT_REFRESH_SECRET,
        env.JWT_ACCESS_EXPIRES_IN,
        env.JWT_REFRESH_EXPIRES_IN,
      );
      res.json({ data: { tokens } });
    } catch {
      res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' });
    }
  });

  // POST /auth/logout
  router.post('/logout', (_req: Request, res: Response): void => {
    // TODO: add refresh token to revocation list in DB/Redis
    res.json({ data: { ok: true } });
  });

  return router;
}
