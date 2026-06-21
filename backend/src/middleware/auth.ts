import type { Context, Next } from 'hono';
import { verifySession, COOKIE_NAME } from '../lib/session.js';
import { getDb } from '../db.js';

export async function requireAuth(c: Context, next: Next) {
  const cookie = getCookie(c, COOKIE_NAME);
  if (!cookie) return c.json({ error: 'Nicht angemeldet.' }, 401);

  const userId = verifySession(cookie);
  if (!userId) return c.json({ error: 'Sitzung abgelaufen.' }, 401);

  const user = getDb().prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
  if (!user) return c.json({ error: 'Benutzer nicht gefunden.' }, 401);

  c.set('user' as never, user as never);
  await next();
}

function getCookie(c: Context, name: string): string | undefined {
  const header = c.req.header('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === name) return v;
  }
}
