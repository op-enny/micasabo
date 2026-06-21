import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { initDb } from './db.js';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }));

const port = Number(process.env.PORT ?? 3001);

initDb();

serve({ fetch: app.fetch, port }, () => {
  console.log(`Backend running on port ${port}`);
});
