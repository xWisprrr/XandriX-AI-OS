import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokenPair,
} from '../jwt.js';

const TEST_SECRET = 'test-access-secret-at-least-32-chars-long!!';
const TEST_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long!!';

describe('JWT utilities', () => {
  describe('signAccessToken / verifyAccessToken', () => {
    it('signs and verifies an access token', () => {
      const payload = { sub: 'user-id-1', email: 'test@example.com', role: 'member' as const };
      const token = signAccessToken(payload, TEST_SECRET, '1h');
      const verified = verifyAccessToken(token, TEST_SECRET);
      expect(verified.sub).toBe(payload.sub);
      expect(verified.email).toBe(payload.email);
      expect(verified.role).toBe(payload.role);
      expect(verified.type).toBe('access');
    });

    it('throws on malformed token', () => {
      expect(() => verifyAccessToken('not.a.token', TEST_SECRET)).toThrow();
    });

    it('throws when signed with a different secret', () => {
      const payload = { sub: 'user-id-1', email: 'test@example.com', role: 'member' as const };
      const token = signAccessToken(payload, TEST_SECRET, '1h');
      expect(() => verifyAccessToken(token, 'wrong-secret-that-is-also-long-enough')).toThrow();
    });

    it('includes type=access in the token payload', () => {
      const payload = { sub: 'user-id-1', email: 'a@b.com', role: 'admin' as const };
      const token = signAccessToken(payload, TEST_SECRET, '1h');
      const verified = verifyAccessToken(token, TEST_SECRET);
      expect(verified.type).toBe('access');
    });
  });

  describe('signRefreshToken / verifyRefreshToken', () => {
    it('signs and verifies a refresh token', () => {
      const payload = { sub: 'user-id-2', email: 'user@example.com', role: 'owner' as const };
      const token = signRefreshToken(payload, TEST_REFRESH_SECRET, '7d');
      const verified = verifyRefreshToken(token, TEST_REFRESH_SECRET);
      expect(verified.sub).toBe(payload.sub);
      expect(verified.email).toBe(payload.email);
      expect(verified.type).toBe('refresh');
    });

    it('throws on wrong secret', () => {
      const payload = { sub: 'user-id-2', email: 'user@example.com', role: 'viewer' as const };
      const token = signRefreshToken(payload, TEST_REFRESH_SECRET, '7d');
      expect(() => verifyRefreshToken(token, 'wrong-secret-that-is-also-long-enough!!')).toThrow();
    });
  });

  describe('createTokenPair', () => {
    it('returns an access token, refresh token, and expiresIn=900', () => {
      const user = { id: 'user-id-3', email: 'owner@example.com', role: 'owner' as const };
      const pair = createTokenPair(user, TEST_SECRET, TEST_REFRESH_SECRET, '15m', '7d');
      expect(pair.accessToken).toBeTruthy();
      expect(pair.refreshToken).toBeTruthy();
      expect(pair.expiresIn).toBe(900);
    });

    it('access token carries type=access', () => {
      const user = { id: 'user-id-3', email: 'admin@example.com', role: 'admin' as const };
      const pair = createTokenPair(user, TEST_SECRET, TEST_REFRESH_SECRET, '15m', '7d');
      const access = verifyAccessToken(pair.accessToken, TEST_SECRET);
      expect(access.type).toBe('access');
      expect(access.sub).toBe(user.id);
    });

    it('refresh token carries type=refresh', () => {
      const user = { id: 'user-id-4', email: 'member@example.com', role: 'member' as const };
      const pair = createTokenPair(user, TEST_SECRET, TEST_REFRESH_SECRET, '15m', '7d');
      const refresh = verifyRefreshToken(pair.refreshToken, TEST_REFRESH_SECRET);
      expect(refresh.type).toBe('refresh');
      expect(refresh.sub).toBe(user.id);
    });

    it('access and refresh tokens are different strings', () => {
      const user = { id: 'user-id-5', email: 'viewer@example.com', role: 'viewer' as const };
      const pair = createTokenPair(user, TEST_SECRET, TEST_REFRESH_SECRET, '15m', '7d');
      expect(pair.accessToken).not.toBe(pair.refreshToken);
    });
  });
});
