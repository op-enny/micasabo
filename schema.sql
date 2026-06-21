-- ============================================================
--  micasabo — SQLite-Datenschema
--  Immobilienverwaltungssystem (Single-Tenant, ein Container)
--  Version: 1.0
-- ============================================================
--  Hinweise:
--   * Datumswerte werden als TEXT im ISO-8601-Format gespeichert
--     (z. B. '2026-06-21' oder '2026-06-21T14:30:00Z').
--   * Boolesche Werte als INTEGER (0 = false, 1 = true) mit CHECK.
--   * Geldbeträge als REAL in Euro. Bei strengen Rundungsanforderungen
--     alternativ INTEGER in Cent verwenden.
--   * Aufzählungen über CHECK-Constraints (SQLite kennt kein ENUM).
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ------------------------------------------------------------
--  users — Admin-Zugang (Single-User, kein RBAC)
-- ------------------------------------------------------------
CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    passwort_hash TEXT NOT NULL,
    totp_secret   TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
--  properties — Objekte (Wohnung, WG, Zimmer, Anlage)
--  WG-Hierarchie über parent_id (Selbstreferenz).
-- ------------------------------------------------------------
CREATE TABLE properties (
    id                    INTEGER PRIMARY KEY,
    typ                   TEXT NOT NULL
                          CHECK (typ IN ('wohnung', 'wg', 'zimmer', 'anlage')),
    parent_id             INTEGER
                          REFERENCES properties(id) ON DELETE CASCADE,
    name                  TEXT NOT NULL,
    moebliert             INTEGER NOT NULL DEFAULT 0 CHECK (moebliert IN (0, 1)),
    internet_vorhanden    INTEGER NOT NULL DEFAULT 0 CHECK (internet_vorhanden IN (0, 1)),
    status                TEXT NOT NULL DEFAULT 'frei'
                          CHECK (status IN ('frei', 'reserviert', 'vermietet')),
    flaeche_qm            REAL,
    zimmer_anzahl         REAL,
    kaltmiete             REAL,
    nebenkosten_pauschal  REAL,
    adresse               TEXT,
    beschreibung          TEXT,
    aktiv_auf_landingpage INTEGER NOT NULL DEFAULT 0 CHECK (aktiv_auf_landingpage IN (0, 1)),
    archiviert            INTEGER NOT NULL DEFAULT 0 CHECK (archiviert IN (0, 1)),
    created_at            TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_properties_parent  ON properties(parent_id);
CREATE INDEX idx_properties_typ     ON properties(typ);
CREATE INDEX idx_properties_status  ON properties(status);
CREATE INDEX idx_properties_landing ON properties(aktiv_auf_landingpage)
    WHERE aktiv_auf_landingpage = 1;

-- ------------------------------------------------------------
--  tenants — Mieter (Stammdaten)
-- ------------------------------------------------------------
CREATE TABLE tenants (
    id           INTEGER PRIMARY KEY,
    vorname      TEXT NOT NULL,
    nachname     TEXT NOT NULL,
    email        TEXT,
    telefon      TEXT,
    geburtsdatum TEXT,
    notizen      TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tenants_name  ON tenants(nachname, vorname);
CREATE INDEX idx_tenants_email ON tenants(email);

-- ------------------------------------------------------------
--  contracts — Mietverträge
--  Ein Vertrag bezieht sich auf genau ein Objekt, kann aber
--  über contract_tenants mehrere Mieter haben (WG-Gesamtmietvertrag).
-- ------------------------------------------------------------
CREATE TABLE contracts (
    id                     INTEGER PRIMARY KEY,
    property_id            INTEGER NOT NULL
                           REFERENCES properties(id) ON DELETE RESTRICT,
    beginn_datum           TEXT NOT NULL,
    ende_datum             TEXT,
    unbefristet            INTEGER NOT NULL DEFAULT 1 CHECK (unbefristet IN (0, 1)),
    kuendigungsfrist_monate INTEGER NOT NULL DEFAULT 3,
    miete_gesamt           REAL NOT NULL,
    nebenkosten            REAL NOT NULL DEFAULT 0,
    status                 TEXT NOT NULL DEFAULT 'aktiv'
                           CHECK (status IN ('aktiv', 'beendet', 'gekuendigt')),
    dokument_pfad          TEXT,
    versendet_am           TEXT,
    created_at             TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_contracts_property ON contracts(property_id);
CREATE INDEX idx_contracts_status   ON contracts(status);

-- ------------------------------------------------------------
--  contract_tenants — Zwischentabelle Vertrag <-> Mieter
--  Kern der WG-Vermietung: dasselbe Objekt / derselbe Vertrag
--  an mehrere Personen. Rolle, Haftung, Anteil, Ein-/Auszug
--  pro Person. Mieterwechsel ohne Vertragsende möglich.
-- ------------------------------------------------------------
CREATE TABLE contract_tenants (
    id                  INTEGER PRIMARY KEY,
    contract_id         INTEGER NOT NULL
                        REFERENCES contracts(id) ON DELETE CASCADE,
    tenant_id           INTEGER NOT NULL
                        REFERENCES tenants(id) ON DELETE RESTRICT,
    rolle               TEXT NOT NULL DEFAULT 'mitmieter'
                        CHECK (rolle IN ('hauptmieter', 'mitmieter', 'untermieter')),
    gesamtschuldnerisch INTEGER NOT NULL DEFAULT 1 CHECK (gesamtschuldnerisch IN (0, 1)),
    mietanteil          REAL,
    einzug              TEXT,
    auszug              TEXT,
    kaution_betrag      REAL,
    kaution_erhalten    INTEGER NOT NULL DEFAULT 0 CHECK (kaution_erhalten IN (0, 1)),
    kaution_zurueck     INTEGER NOT NULL DEFAULT 0 CHECK (kaution_zurueck IN (0, 1)),
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Eine Person darf in einem Vertrag nur einen aktiven (noch nicht
-- ausgezogenen) Eintrag haben. Nach Auszug ist ein erneuter Einzug
-- (neuer Eintrag) erlaubt.
CREATE UNIQUE INDEX uix_contract_tenant_aktiv
    ON contract_tenants(contract_id, tenant_id)
    WHERE auszug IS NULL;

CREATE INDEX idx_ct_contract ON contract_tenants(contract_id);
CREATE INDEX idx_ct_tenant   ON contract_tenants(tenant_id);
-- Schneller Zugriff auf die aktuelle Belegung (auszug IS NULL):
CREATE INDEX idx_ct_aktiv    ON contract_tenants(contract_id)
    WHERE auszug IS NULL;

-- ------------------------------------------------------------
--  payments — Zahlungen
--  Hängen am Vertrag. tenant_id optional: bei WGs kann erfasst
--  werden, welche Person konkret gezahlt hat.
-- ------------------------------------------------------------
CREATE TABLE payments (
    id            INTEGER PRIMARY KEY,
    contract_id   INTEGER NOT NULL
                  REFERENCES contracts(id) ON DELETE CASCADE,
    tenant_id     INTEGER
                  REFERENCES tenants(id) ON DELETE SET NULL,
    faellig_am    TEXT NOT NULL,
    eingegangen_am TEXT,
    betrag        REAL NOT NULL,
    typ           TEXT NOT NULL DEFAULT 'miete'
                  CHECK (typ IN ('miete', 'nebenkosten', 'kaution')),
    status        TEXT NOT NULL DEFAULT 'offen'
                  CHECK (status IN ('offen', 'bezahlt', 'ueberfaellig')),
    mahnstufe     INTEGER NOT NULL DEFAULT 0
                  CHECK (mahnstufe BETWEEN 0 AND 3),
    notiz         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_tenant   ON payments(tenant_id);
CREATE INDEX idx_payments_status   ON payments(status);
CREATE INDEX idx_payments_faellig  ON payments(faellig_am);

-- ------------------------------------------------------------
--  leads — Anfragen / Interessenten (Lead-Pipeline)
-- ------------------------------------------------------------
CREATE TABLE leads (
    id             INTEGER PRIMARY KEY,
    property_id    INTEGER
                   REFERENCES properties(id) ON DELETE SET NULL,
    name           TEXT NOT NULL,
    email          TEXT,
    telefon        TEXT,
    nachricht      TEXT,
    einwilligung   INTEGER NOT NULL DEFAULT 0 CHECK (einwilligung IN (0, 1)),
    status         TEXT NOT NULL DEFAULT 'neu'
                   CHECK (status IN ('neu', 'kontaktiert', 'besichtigung', 'zugesagt', 'abgelehnt')),
    notizen_intern TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_status   ON leads(status);

-- ------------------------------------------------------------
--  handwerker — Kontaktbuch für Instandhaltung
-- ------------------------------------------------------------
CREATE TABLE handwerker (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    firma      TEXT,
    gewerk     TEXT,
    telefon    TEXT,
    email      TEXT,
    notizen    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
--  maintenance — Reparatur- / Instandhaltungsmeldungen
-- ------------------------------------------------------------
CREATE TABLE maintenance (
    id            INTEGER PRIMARY KEY,
    property_id   INTEGER NOT NULL
                  REFERENCES properties(id) ON DELETE CASCADE,
    handwerker_id INTEGER
                  REFERENCES handwerker(id) ON DELETE SET NULL,
    titel         TEXT NOT NULL,
    beschreibung  TEXT,
    status        TEXT NOT NULL DEFAULT 'offen'
                  CHECK (status IN ('offen', 'beauftragt', 'erledigt')),
    kosten        REAL,
    gemeldet_am   TEXT NOT NULL DEFAULT (datetime('now')),
    erledigt_am   TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_maintenance_property ON maintenance(property_id);
CREATE INDEX idx_maintenance_status   ON maintenance(status);

-- ------------------------------------------------------------
--  documents — Datei-Metadaten (Verträge, Ausweise, Protokolle …)
--  Optional an Objekt, Mieter und/oder Vertrag gebunden.
-- ------------------------------------------------------------
CREATE TABLE documents (
    id           INTEGER PRIMARY KEY,
    property_id  INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id    INTEGER REFERENCES tenants(id)    ON DELETE CASCADE,
    contract_id  INTEGER REFERENCES contracts(id)  ON DELETE CASCADE,
    dateiname    TEXT NOT NULL,
    pfad         TEXT NOT NULL,
    typ          TEXT,
    groesse_bytes INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_tenant   ON documents(tenant_id);
CREATE INDEX idx_documents_contract ON documents(contract_id);

-- ------------------------------------------------------------
--  property_photos — Fotos pro Objekt
-- ------------------------------------------------------------
CREATE TABLE property_photos (
    id           INTEGER PRIMARY KEY,
    property_id  INTEGER NOT NULL
                 REFERENCES properties(id) ON DELETE CASCADE,
    pfad         TEXT NOT NULL,
    reihenfolge  INTEGER NOT NULL DEFAULT 0,
    ist_titelbild INTEGER NOT NULL DEFAULT 0 CHECK (ist_titelbild IN (0, 1)),
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_photos_property ON property_photos(property_id);

-- ------------------------------------------------------------
--  settings — Konfiguration (Schlüssel/Wert)
-- ------------------------------------------------------------
CREATE TABLE settings (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
--  audit_log — Nachvollziehbarkeit (DSGVO / Zugriffsprotokoll)
-- ------------------------------------------------------------
CREATE TABLE audit_log (
    id          INTEGER PRIMARY KEY,
    aktion      TEXT NOT NULL,
    entitaet    TEXT,
    entitaet_id INTEGER,
    details     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_entitaet ON audit_log(entitaet, entitaet_id);
CREATE INDEX idx_audit_created  ON audit_log(created_at);

-- ============================================================
--  Trigger: updated_at automatisch pflegen
-- ============================================================
CREATE TRIGGER trg_properties_updated
AFTER UPDATE ON properties FOR EACH ROW BEGIN
    UPDATE properties SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER trg_tenants_updated
AFTER UPDATE ON tenants FOR EACH ROW BEGIN
    UPDATE tenants SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER trg_contracts_updated
AFTER UPDATE ON contracts FOR EACH ROW BEGIN
    UPDATE contracts SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER trg_payments_updated
AFTER UPDATE ON payments FOR EACH ROW BEGIN
    UPDATE payments SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER trg_leads_updated
AFTER UPDATE ON leads FOR EACH ROW BEGIN
    UPDATE leads SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER trg_maintenance_updated
AFTER UPDATE ON maintenance FOR EACH ROW BEGIN
    UPDATE maintenance SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ============================================================
--  Views: praktische Abfragen
-- ============================================================

-- Aktuelle Belegung je Vertrag (nur Mieter ohne Auszug)
CREATE VIEW v_aktuelle_belegung AS
SELECT
    ct.contract_id,
    c.property_id,
    ct.tenant_id,
    t.vorname,
    t.nachname,
    ct.rolle,
    ct.gesamtschuldnerisch,
    ct.mietanteil,
    ct.einzug
FROM contract_tenants ct
JOIN tenants   t ON t.id = ct.tenant_id
JOIN contracts c ON c.id = ct.contract_id
WHERE ct.auszug IS NULL;

-- Offene / überfällige Zahlungen mit Objektbezug
CREATE VIEW v_offene_zahlungen AS
SELECT
    p.id            AS payment_id,
    p.contract_id,
    c.property_id,
    pr.name         AS objekt_name,
    p.betrag,
    p.faellig_am,
    p.status,
    p.mahnstufe
FROM payments p
JOIN contracts  c  ON c.id  = p.contract_id
JOIN properties pr ON pr.id = c.property_id
WHERE p.status IN ('offen', 'ueberfaellig');
