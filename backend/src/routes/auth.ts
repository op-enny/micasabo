import { Hono } from 'hono';
import * as argon2 from 'argon2';
import { getDb } from '../db.js';
import { signSession, verifySession, COOKIE_NAME, COOKIE_OPTS } from '../lib/session.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = new Hono();

authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  if (!email || !password) return c.json({ error: 'E-Mail und Passwort erforderlich.' }, 400);

  const user = getDb()
    .prepare('SELECT id, email, passwort_hash FROM users WHERE email = ?')
    .get(email) as { id: number; email: string; passwort_hash: string } | undefined;

  if (!user || !(await argon2.verify(user.passwort_hash, password))) {
    return c.json({ error: 'Ungültige Anmeldedaten.' }, 401);
  }

  const token = signSession(user.id);
  c.header('Set-Cookie', `${COOKIE_NAME}=${token}; ${COOKIE_OPTS}`);
  return c.json({ id: user.id, email: user.email });
});

authRouter.post('/logout', (c) => {
  c.header('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
  return c.json({ ok: true });
});

authRouter.get('/me', requireAuth, (c) => {
  return c.json(c.get('user' as never));
});
