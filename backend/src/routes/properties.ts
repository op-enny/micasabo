import { Hono } from 'hono';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

export const propertiesRouter = new Hono();
propertiesRouter.use('*', requireAuth);

propertiesRouter.get('/', (c) => {
  const { typ, status, parent_id } = c.req.query();
  let sql = 'SELECT * FROM properties WHERE archiviert = 0';
  const params: unknown[] = [];
  if (typ) { sql += ' AND typ = ?'; params.push(typ); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (parent_id !== undefined) {
    sql += parent_id === 'null' ? ' AND parent_id IS NULL' : ' AND parent_id = ?';
    if (parent_id !== 'null') params.push(Number(parent_id));
  }
  sql += ' ORDER BY name';
  return c.json(getDb().prepare(sql).all(...params));
});

propertiesRouter.get('/:id', (c) => {
  const row = getDb().prepare('SELECT * FROM properties WHERE id = ?').get(c.req.param('id'));
  if (!row) return c.json({ error: 'Nicht gefunden.' }, 404);
  return c.json(row);
});

propertiesRouter.post('/', async (c) => {
  const body = await c.req.json();
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO properties
      (typ, parent_id, name, moebliert, internet_vorhanden, status,
       flaeche_qm, zimmer_anzahl, kaltmiete, nebenkosten_pauschal,
       adresse, beschreibung, aktiv_auf_landingpage)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    body.typ, body.parent_id ?? null, body.name,
    body.moebliert ? 1 : 0, body.internet_vorhanden ? 1 : 0,
    body.status ?? 'frei',
    body.flaeche_qm ?? null, body.zimmer_anzahl ?? null,
    body.kaltmiete ?? null, body.nebenkosten_pauschal ?? null,
    body.adresse ?? null, body.beschreibung ?? null,
    body.aktiv_auf_landingpage ? 1 : 0
  );
  logAudit('create', 'properties', Number(result.lastInsertRowid), body);
  return c.json({ id: result.lastInsertRowid }, 201);
});

propertiesRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  getDb().prepare(`
    UPDATE properties SET
      typ = ?, parent_id = ?, name = ?, moebliert = ?, internet_vorhanden = ?,
      status = ?, flaeche_qm = ?, zimmer_anzahl = ?, kaltmiete = ?,
      nebenkosten_pauschal = ?, adresse = ?, beschreibung = ?, aktiv_auf_landingpage = ?
    WHERE id = ?
  `).run(
    body.typ, body.parent_id ?? null, body.name,
    body.moebliert ? 1 : 0, body.internet_vorhanden ? 1 : 0,
    body.status ?? 'frei',
    body.flaeche_qm ?? null, body.zimmer_anzahl ?? null,
    body.kaltmiete ?? null, body.nebenkosten_pauschal ?? null,
    body.adresse ?? null, body.beschreibung ?? null,
    body.aktiv_auf_landingpage ? 1 : 0, id
  );
  logAudit('update', 'properties', Number(id), body);
  return c.json({ ok: true });
});

propertiesRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  // Soft-delete: archive instead of hard delete
  getDb().prepare('UPDATE properties SET archiviert = 1 WHERE id = ?').run(id);
  logAudit('archive', 'properties', Number(id), {});
  return c.json({ ok: true });
});

// Rooms under a WG
propertiesRouter.get('/:id/zimmer', (c) => {
  const rooms = getDb()
    .prepare('SELECT * FROM properties WHERE parent_id = ? AND typ = ? ORDER BY name')
    .all(c.req.param('id'), 'zimmer');
  return c.json(rooms);
});
