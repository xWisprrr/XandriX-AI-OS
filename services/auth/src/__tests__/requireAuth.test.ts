import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { signAccessToken, signRefreshToken } from '../jwt.js';

const TEST_SECRET = 'test-access-secret-at-least-32-chars-long!!';

function makeReqResNext(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as Request;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next, json, status };
}

describe('requireAuth middleware', () => {
  it('calls next() when a valid access token is provided', () => {
    const token = signAccessToken(
      { sub: 'user-1', email: 'a@b.com', role: 'member' },
      TEST_SECRET,
      '1h',
    );
    const { req, res, next } = makeReqResNext({ authorization: `Bearer ${token}` });
    requireAuth(TEST_SECRET)(req as never, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sets req.auth with userId, email, role', () => {
    const token = signAccessToken(
      { sub: 'user-42', email: 'admin@example.com', role: 'admin' },
      TEST_SECRET,
      '1h',
    );
    const { req, res, next } = makeReqResNext({ authorization: `Bearer ${token}` });
    requireAuth(TEST_SECRET)(req as never, res, next);
    const authedReq = req as unknown as { auth?: { userId: string; email: string; role: string } };
    expect(authedReq.auth?.userId).toBe('user-42');
    expect(authedReq.auth?.email).toBe('admin@example.com');
    expect(authedReq.auth?.role).toBe('admin');
  });

  it('returns 401 when Authorization header is missing', () => {
    const { req, res, next, status, json } = makeReqResNext({});
    requireAuth(TEST_SECRET)(req as never, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'UNAUTHORIZED' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', () => {
    const { req, res, next, status } = makeReqResNext({ authorization: 'Basic sometoken' });
    requireAuth(TEST_SECRET)(req as never, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid token', () => {
    const { req, res, next, status } = makeReqResNext({ authorization: 'Bearer invalid.token' });
    requireAuth(TEST_SECRET)(req as never, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when a refresh token is used instead of access token', () => {
    const token = signRefreshToken(
      { sub: 'user-1', email: 'a@b.com', role: 'member' },
      TEST_SECRET,
      '7d',
    );
    const { req, res, next, status } = makeReqResNext({ authorization: `Bearer ${token}` });
    requireAuth(TEST_SECRET)(req as never, res, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
