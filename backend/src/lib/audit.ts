import { getDb } from '../db.js';

export function logAudit(aktion: string, entitaet: string, entitaetId: number, details: unknown) {
  getDb().prepare(`
    INSERT INTO audit_log (aktion, entitaet, entitaet_id, details)
    VALUES (?,?,?,?)
  `).run(aktion, entitaet, entitaetId, JSON.stringify(details));
}
