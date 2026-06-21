import { Hono } from 'hono';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

export const tenantsRouter = new Hono();
tenantsRouter.use('*', requireAuth);

tenantsRouter.get('/', (c) => {
  const { q } = c.req.query();
  let sql = 'SELECT * FROM tenants';
  const params: unknown[] = [];
  if (q) {
    sql += " WHERE nachname LIKE ? OR vorname LIKE ? OR email LIKE ?";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY nachname, vorname';
  return c.json(getDb().prepare(sql).all(...params));
});

tenantsRouter.get('/:id', (c) => {
  const row = getDb().prepare('SELECT * FROM tenants WHERE id = ?').get(c.req.param('id'));
  if (!row) return c.json({ error: 'Nicht gefunden.' }, 404);
  return c.json(row);
});

tenantsRouter.get('/:id/contracts', (c) => {
  const rows = getDb().prepare(`
    SELECT ct.*, c.property_id, c.beginn_datum, c.ende_datum, c.miete_gesamt, c.status,
           p.name AS objekt_name
    FROM contract_tenants ct
    JOIN contracts c ON c.id = ct.contract_id
    JOIN properties p ON p.id = c.property_id
    WHERE ct.tenant_id = ?
    ORDER BY ct.einzug DESC
  `).all(c.req.param('id'));
  return c.json(rows);
});

tenantsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const result = getDb().prepare(`
    INSERT INTO tenants (vorname, nachname, email, telefon, geburtsdatum, notizen)
    VALUES (?,?,?,?,?,?)
  `).run(body.vorname, body.nachname, body.email ?? null,
    body.telefon ?? null, body.geburtsdatum ?? null, body.notizen ?? null);
  logAudit('create', 'tenants', Number(result.lastInsertRowid), body);
  return c.json({ id: result.lastInsertRowid }, 201);
});

tenantsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  getDb().prepare(`
    UPDATE tenants SET vorname=?, nachname=?, email=?, telefon=?, geburtsdatum=?, notizen=?
    WHERE id=?
  `).run(body.vorname, body.nachname, body.email ?? null,
    body.telefon ?? null, body.geburtsdatum ?? null, body.notizen ?? null, id);
  logAudit('update', 'tenants', Number(id), body);
  return c.json({ ok: true });
});

tenantsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  getDb().prepare('DELETE FROM tenants WHERE id = ?').run(id);
  logAudit('delete', 'tenants', Number(id), {});
  return c.json({ ok: true });
});
