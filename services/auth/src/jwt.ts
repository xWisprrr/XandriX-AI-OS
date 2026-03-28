import jwt from 'jsonwebtoken';
import type { TokenPair, User } from '@xandrix/types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: User['role'];
  type: 'access' | 'refresh';
}

export function signAccessToken(
  payload: Omit<JwtPayload, 'type'>,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn } as jwt.SignOptions);
}

export function signRefreshToken(
  payload: Omit<JwtPayload, 'type'>,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn } as jwt.SignOptions);
}

export function createTokenPair(
  user: Pick<User, 'id' | 'email' | 'role'>,
  accessSecret: string,
  refreshSecret: string,
  accessExpiresIn: string,
  refreshExpiresIn: string,
): TokenPair {
  const base = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(base, accessSecret, accessExpiresIn),
    refreshToken: signRefreshToken(base, refreshSecret, refreshExpiresIn),
    expiresIn: 900,
  };
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
