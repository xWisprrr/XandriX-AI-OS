import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../jwt.js';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function requireAuth(secret: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
      return;
    }
    const token = header.slice(7);
    try {
      const payload = verifyAccessToken(token, secret);
      if (payload.type !== 'access') {
        res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token type' });
        return;
      }
      req.auth = { userId: payload.sub, email: payload.email, role: payload.role };
      next();
    } catch {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    }
  };
}
