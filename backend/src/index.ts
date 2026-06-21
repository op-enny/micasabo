import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as argon2 from 'argon2';
import { initDb, getDb } from './db.js';
import { authRouter } from './routes/auth.js';
import { propertiesRouter } from './routes/properties.js';
import { tenantsRouter } from './routes/tenants.js';
import { contractsRouter } from './routes/contracts.js';
import { uploadsRouter } from './routes/uploads.js';

const app = new Hono();

app.use('*', cors({ origin: process.env.FRONTEND_ORIGIN ?? '*', credentials: true }));

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }));

app.route('/api/auth', authRouter);
app.route('/api/properties', propertiesRouter);
app.route('/api/tenants', tenantsRouter);
app.route('/api/contracts', contractsRouter);
app.route('/api/uploads', uploadsRouter);

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const exists = getDb().prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return;

  const hash = await argon2.hash(password);
  getDb().prepare('INSERT INTO users (email, passwort_hash) VALUES (?,?)').run(email, hash);
  console.log(`Admin user created: ${email}`);
}

const port = Number(process.env.PORT ?? 3001);

initDb();
seedAdmin().then(() => {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Backend running on port ${port}`);
  });
});
