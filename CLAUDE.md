# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**micasabo** is a self-hosted, single-tenant property management system for small landlords in Germany. One Docker container per management company. SQLite-backed. No external DB server.

> Status: **early development** — the monorepo scaffold has not been created yet. Phase 0 is the starting point.

---

## Commands

Once the monorepo is scaffolded, commands will live in:

- `frontend/` — SvelteKit (`npm run dev`, `npm run build`, `npm run check`)
- `backend/` — Hono (Node) or FastAPI (Python)
- `infra/` — `docker compose up --build`

Until those exist, the primary entry point is:

```bash
cp .env.example .env   # configure DB path, SMTP, S3 credentials, admin secret
docker compose up --build
```

Database initialisation (first run only):
```bash
sqlite3 data/micasabo.db < schema.sql
```

SQLite foreign keys and WAL mode are enabled at the top of `schema.sql` via `PRAGMA` statements. The backend must also set `PRAGMA foreign_keys = ON` on every new connection (PRAGMAs do not persist).

`updated_at` columns are maintained automatically by per-table `AFTER UPDATE` triggers defined in `schema.sql` — do not update them manually.

---

## Architecture

```
Internet → Caddy (HTTPS) → SvelteKit frontend → Hono/FastAPI backend → SQLite
                                                                      └─ Litestream → S3
```

- **Single-tenant**: one company per container instance; no multi-tenancy in code.
- **Frontend**: SvelteKit serves both the authenticated admin UI and the public listing page in one build.
- **Backend**: slim REST API handling CRUD, PDF generation (Puppeteer/WeasyPrint), SMTP, and a cron job for payment due dates / dunning stages.
- **Database**: SQLite only. Litestream streams continuous encrypted backups to S3-compatible storage.
- **AI (Phase 5, optional)**: a separate, optional container that calls only the REST API — never has direct DB access. Personal data must be pseudonymised before any external LLM call.

---

## Data model

Key tables and their relationships:

| Table | Purpose |
|---|---|
| `properties` | Flats, WG (shared flat), rooms, complexes. `parent_id` links WG-rooms to their parent WG. |
| `tenants` | Lightweight CRM: contact data, deposit tracking, documents. |
| `contracts` | One contract per rental unit. Holds `miete_gesamt`. |
| `contract_tenants` | **Many-to-many**: one contract → multiple tenants (WG joint liability). Fields: `rolle`, `gesamtschuldnerisch`, `mietanteil`, `einzug`, `auszug`. |
| `payments` | Monthly rent entries; overdue flag set by cron. |
| `leads` | Inquiries from the public listing page, status pipeline. |
| `maintenance` | Repair requests, contractor contacts, costs. |
| `documents` | File metadata for uploaded tenant/property docs. |
| `audit_log` | Every write action for GDPR auditability. |

**WG (shared flat) key invariant**: current occupancy = `contract_tenants WHERE auszug IS NULL`. Tenant turnover is recorded by setting `auszug` on the departing person and inserting a new row — the contract is never closed. A partial unique index prevents a person appearing twice as an active tenant on the same contract.

Two helper views: `v_aktuelle_belegung` (current occupancy), `v_offene_zahlungen` (open/overdue payments).

---

## Development phases

| Phase | Focus | Entry criteria |
|---|---|---|
| 0 | Repo scaffold, Docker Compose, SQLite connection, health-check endpoint, login page shell | — |
| 1 | Full schema, auth (session cookies, argon2), CRUD for properties and tenants, WG hierarchy, `contract_tenants` | Phase 0 done |
| 2 | Template engine (Handlebars/Nunjucks), contract PDF generation, SMTP send, archiving | Phase 1 done |
| 3 | Payments & dunning cron, lead inbox, public listing page with GDPR contact form | Phase 2 done |
| 4 | TOTP 2FA, rate-limiting, HSTS, GDPR delete/export, Litestream, server hardening | Before any real tenant data |
| 5 | Optional AI container (listing copy, draft replies) — never AI-generated contracts | Phases 1–4 stable |

**Do not generate or send contracts via AI (Phase 5 or any LLM tooling).** Contracts are legally binding; they must come from the rule-based template engine.

---

## Security & GDPR constraints

- Passwords: argon2 or bcrypt. Sessions: httpOnly, Secure, SameSite=Strict cookies.
- Documents served only through signed routes — never exposed directly.
- GDPR delete and JSON-export functions are required before going live with real tenant data (Phase 4).
- Every write to personal data must be logged in `audit_log`.
- Rate-limit the login endpoint and any public-facing form.
- Containers must run as non-root.
