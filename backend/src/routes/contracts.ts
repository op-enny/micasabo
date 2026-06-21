import { Hono } from 'hono';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

export const contractsRouter = new Hono();
contractsRouter.use('*', requireAuth);

contractsRouter.get('/', (c) => {
  const { property_id } = c.req.query();
  let sql = `
    SELECT c.*, p.name AS objekt_name
    FROM contracts c JOIN properties p ON p.id = c.property_id
  `;
  const params: unknown[] = [];
  if (property_id) { sql += ' WHERE c.property_id = ?'; params.push(property_id); }
  sql += ' ORDER BY c.beginn_datum DESC';
  return c.json(getDb().prepare(sql).all(...params));
});

contractsRouter.get('/:id', (c) => {
  const contract = getDb().prepare(`
    SELECT c.*, p.name AS objekt_name
    FROM contracts c JOIN properties p ON p.id = c.property_id
    WHERE c.id = ?
  `).get(c.req.param('id'));
  if (!contract) return c.json({ error: 'Nicht gefunden.' }, 404);

  const tenants = getDb().prepare(`
    SELECT ct.*, t.vorname, t.nachname, t.email, t.telefon
    FROM contract_tenants ct JOIN tenants t ON t.id = ct.tenant_id
    WHERE ct.contract_id = ?
    ORDER BY ct.rolle, t.nachname
  `).all(c.req.param('id'));

  return c.json({ ...contract as object, tenants });
});

contractsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const result = getDb().prepare(`
    INSERT INTO contracts
      (property_id, beginn_datum, ende_datum, unbefristet,
       kuendigungsfrist_monate, miete_gesamt, nebenkosten, status)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    body.property_id, body.beginn_datum, body.ende_datum ?? null,
    body.unbefristet ? 1 : 0, body.kuendigungsfrist_monate ?? 3,
    body.miete_gesamt, body.nebenkosten ?? 0, 'aktiv'
  );
  logAudit('create', 'contracts', Number(result.lastInsertRowid), body);
  return c.json({ id: result.lastInsertRowid }, 201);
});

contractsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  getDb().prepare(`
    UPDATE contracts SET
      beginn_datum=?, ende_datum=?, unbefristet=?, kuendigungsfrist_monate=?,
      miete_gesamt=?, nebenkosten=?, status=?
    WHERE id=?
  `).run(
    body.beginn_datum, body.ende_datum ?? null, body.unbefristet ? 1 : 0,
    body.kuendigungsfrist_monate ?? 3, body.miete_gesamt, body.nebenkosten ?? 0,
    body.status ?? 'aktiv', id
  );
  logAudit('update', 'contracts', Number(id), body);
  return c.json({ ok: true });
});

// --- contract_tenants (WG occupancy) ---

contractsRouter.get('/:id/tenants', (c) => {
  const rows = getDb().prepare(`
    SELECT ct.*, t.vorname, t.nachname, t.email, t.telefon
    FROM contract_tenants ct JOIN tenants t ON t.id = ct.tenant_id
    WHERE ct.contract_id = ?
    ORDER BY ct.auszug IS NULL DESC, t.nachname
  `).all(c.req.param('id'));
  return c.json(rows);
});

contractsRouter.post('/:id/tenants', async (c) => {
  const body = await c.req.json();
  const result = getDb().prepare(`
    INSERT INTO contract_tenants
      (contract_id, tenant_id, rolle, gesamtschuldnerisch,
       mietanteil, einzug, kaution_betrag, kaution_erhalten)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(
    c.req.param('id'), body.tenant_id,
    body.rolle ?? 'mitmieter', body.gesamtschuldnerisch ? 1 : 0,
    body.mietanteil ?? null, body.einzug ?? null,
    body.kaution_betrag ?? null, body.kaution_erhalten ? 1 : 0
  );
  logAudit('create', 'contract_tenants', Number(result.lastInsertRowid), body);
  return c.json({ id: result.lastInsertRowid }, 201);
});

// Record move-out (sets auszug date, does not delete the row)
contractsRouter.patch('/:id/tenants/:ctId/auszug', async (c) => {
  const { auszug } = await c.req.json<{ auszug: string }>();
  getDb().prepare('UPDATE contract_tenants SET auszug=? WHERE id=? AND contract_id=?')
    .run(auszug, c.req.param('ctId'), c.req.param('id'));
  logAudit('auszug', 'contract_tenants', Number(c.req.param('ctId')), { auszug });
  return c.json({ ok: true });
});

// Record deposit return
contractsRouter.patch('/:id/tenants/:ctId/kaution', async (c) => {
  const { kaution_zurueck } = await c.req.json<{ kaution_zurueck: boolean }>();
  getDb().prepare('UPDATE contract_tenants SET kaution_zurueck=? WHERE id=? AND contract_id=?')
    .run(kaution_zurueck ? 1 : 0, c.req.param('ctId'), c.req.param('id'));
  logAudit('kaution_zurueck', 'contract_tenants', Number(c.req.param('ctId')), { kaution_zurueck });
  return c.json({ ok: true });
});
