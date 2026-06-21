import { Hono } from 'hono';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/data/uploads';

export const uploadsRouter = new Hono();
uploadsRouter.use('*', requireAuth);

uploadsRouter.post('/photos/:propertyId', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return c.json({ error: 'Keine Datei.' }, 400);

  const ext = extname(file.name) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  const dir = join(UPLOAD_DIR, 'photos');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const propertyId = c.req.param('propertyId');
  const result = getDb().prepare(`
    INSERT INTO property_photos (property_id, pfad, reihenfolge)
    VALUES (?, ?, (SELECT COALESCE(MAX(reihenfolge),0)+1 FROM property_photos WHERE property_id=?))
  `).run(propertyId, `photos/${filename}`, propertyId);

  return c.json({ id: result.lastInsertRowid, pfad: `photos/${filename}` }, 201);
});

uploadsRouter.delete('/photos/:photoId', (c) => {
  getDb().prepare('DELETE FROM property_photos WHERE id = ?').run(c.req.param('photoId'));
  return c.json({ ok: true });
});

uploadsRouter.post('/documents', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const propertyId = formData.get('property_id') as string | null;
  const tenantId = formData.get('tenant_id') as string | null;
  const contractId = formData.get('contract_id') as string | null;
  const typ = formData.get('typ') as string | null;

  if (!file) return c.json({ error: 'Keine Datei.' }, 400);

  const ext = extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const dir = join(UPLOAD_DIR, 'documents');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const result = getDb().prepare(`
    INSERT INTO documents (property_id, tenant_id, contract_id, dateiname, pfad, typ, groesse_bytes)
    VALUES (?,?,?,?,?,?,?)
  `).run(
    propertyId ? Number(propertyId) : null,
    tenantId ? Number(tenantId) : null,
    contractId ? Number(contractId) : null,
    file.name, `documents/${filename}`, typ, file.size
  );

  return c.json({ id: result.lastInsertRowid }, 201);
});

uploadsRouter.get('/documents', (c) => {
  const { property_id, tenant_id, contract_id } = c.req.query();
  let sql = 'SELECT * FROM documents WHERE 1=1';
  const params: unknown[] = [];
  if (property_id) { sql += ' AND property_id = ?'; params.push(property_id); }
  if (tenant_id) { sql += ' AND tenant_id = ?'; params.push(tenant_id); }
  if (contract_id) { sql += ' AND contract_id = ?'; params.push(contract_id); }
  sql += ' ORDER BY created_at DESC';
  return c.json(getDb().prepare(sql).all(...params));
});
