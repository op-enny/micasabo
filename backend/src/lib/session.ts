import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-me';
const MAX_AGE_S = 60 * 60 * 24 * 14; // 14 days

interface SessionPayload {
  userId: number;
  exp: number;
}

export function signSession(userId: number): string {
  const payload: SessionPayload = { userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySession(token: string): number | null {
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(data).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload.userId;
}

export const COOKIE_NAME = 'session';
export const COOKIE_OPTS = `HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_S}`;
