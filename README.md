# micasabo

A lightweight, self-hosted property management system for small landlords and
property managers — built to automate the repetitive, time-consuming parts of
managing rentals in Germany.

micasabo runs as a single Docker container per management unit on a VPS. It is
deliberately **single-tenant** (one company per instance), uses **SQLite** instead
of a heavy database server, and ships with first-class support for the **German WG
(shared flat) rental model**, where the same unit is rented to multiple tenants.

> Status: early development · classic rule-based core first, optional AI later.

---

## Features

- **Property management** — flats, shared flats (WG), individual rooms, and complexes.
  Furnished/unfurnished flag, per-complex internet flag, photos, descriptions.
- **WG rental support** — the same unit can be rented to multiple tenants on one
  contract (joint and several liability / *gesamtschuldnerische Haftung*), with
  per-person role, rent share, and move-in/move-out dates. Tenant turnover without
  ending the contract.
- **Tenant management** — lightweight CRM: contact data, documents, deposit tracking,
  communication history.
- **Template-based contracts** — generate rental contracts from HTML templates,
  fill placeholders from the database, preview, render to PDF, and send by email.
  Rule-based, no AI — predictable and auditable.
- **Payments & dunning** — track incoming rent, flag overdue payments, staged
  reminders (Mahnstufen 0–3), CSV export.
- **Lead inbox** — inquiries from the public listing page flow into a status pipeline.
- **Maintenance** — repair requests, contractor contacts, cost tracking.
- **Public listing page** — auto-populated from available units, with a GDPR-compliant
  contact form.
- **Privacy & security by design** — GDPR (DSGVO) delete/export functions, encrypted
  backups, audit log, hardened deployment.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Reverse proxy | Caddy | Automatic HTTPS, minimal config |
| Frontend | SvelteKit | Lightweight; admin UI + public listing page in one build |
| Backend | Hono (Node) **or** FastAPI (Python) | Slim, fast |
| Database | SQLite | No separate DB server needed |
| Backup | Litestream → S3 | Continuous, encrypted |
| Templating | Handlebars / Nunjucks | Contract placeholder rendering |
| PDF | Puppeteer / WeasyPrint | HTML → PDF |
| Email | SMTP | Sending contracts with attachments |
| Orchestration | Docker Compose | One container per management unit |

---

## Architecture

```
                    ┌─────────────────────────────────────┐
   Internet ───────▶│  Caddy (reverse proxy, auto-HTTPS)   │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │  Frontend (SvelteKit)                │
                    │  · Admin UI   · Public listing page  │
                    └───────────────┬─────────────────────┘
                                    │ REST
                    ┌───────────────▼─────────────────────┐
                    │  Backend API                         │
                    │  · CRUD   · PDF gen   · SMTP          │
                    │  · Cron (due dates, dunning)         │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │  SQLite  ──(Litestream)──▶ S3 backup │
                    │  File volume (PDFs, photos, docs)    │
                    └─────────────────────────────────────┘
```

Each management unit is fully isolated in its own container. Provisioning a new one
is `docker compose up`. AI agents — if ever added — live in a separate, optional
container that only talks to the REST API; they are not part of the core.

---

## Getting started

### Prerequisites

- Docker and Docker Compose
- A VPS with ports 80 and 443 reachable (for production HTTPS)
- An SMTP account and (optionally) an S3-compatible bucket for backups

### Run locally

```bash
git clone https://github.com/<your-org>/micasabo.git
cd micasabo
cp .env.example .env      # fill in DB path, SMTP, S3 credentials, admin secret
docker compose up --build
```

The admin UI will be available at `https://localhost` (self-signed in dev) and the
public listing page at the configured domain root.

### Initialise the database

The SQLite schema lives in [`schema.sql`](./schema.sql). Apply it on first run:

```bash
# inside the backend container, or with any SQLite client
sqlite3 data/micasabo.db < schema.sql
```

> **Important:** SQLite only enforces foreign keys when `PRAGMA foreign_keys = ON`
> is set **per connection**. Make sure the backend sets it on every connection.

---

## Project structure

```
micasabo/
├── frontend/          # SvelteKit app (admin UI + public listing page)
├── backend/           # REST API, PDF generation, SMTP, cron jobs
├── infra/             # Caddyfile, docker-compose.yml, Litestream config
├── templates/         # HTML contract templates (Wohnung, WG-Gesamtmietvertrag, …)
├── schema.sql         # SQLite schema
├── PROD.md            # Product specification
├── PLAN.md            # Phased development plan with milestones
└── README.md
```

---

## Data model

Core tables: `properties`, `tenants`, `contracts`, `contract_tenants`, `payments`,
`leads`, `maintenance`, `handwerker`, `documents`, `property_photos`, `settings`,
`users`, `audit_log`.

The WG model is resolved through the **`contract_tenants`** junction table, which lets
one contract have many tenants — each with their own role, liability flag, rent share,
and move-in/move-out dates. A partial unique index prevents a person from being listed
twice as an active tenant on the same contract, while still allowing re-entry after a
recorded move-out. Two helper views are included: `v_aktuelle_belegung` (current
occupancy) and `v_offene_zahlungen` (open/overdue payments).

See [`schema.sql`](./schema.sql) for the full definition and [`PROD.md`](./PROD.md)
for the rationale.

---

## Security & privacy

- Single admin account, argon2/bcrypt password hashing, optional TOTP (2FA).
- HTTPS enforced (HSTS), secure session cookies, rate-limited login.
- Documents served only via signed routes; the database is never exposed externally.
- GDPR (DSGVO): consent on the contact form, delete and export functions for personal
  data, and an audit log.
- Encrypted, continuous backups via Litestream.

If AI features are added later, personal data must be pseudonymised before any external
LLM call — or a local model (e.g. Ollama) used instead.

---

## Roadmap

Development is organised into phases; each delivers a deployable increment.

- **Phase 0** — Foundation & setup (containers, DB, skeleton)
- **Phase 1** — Property & tenant management, WG multi-tenant contracts
- **Phase 2** — Template-based contracts, PDF, email sending
- **Phase 3** — Payments, lead inbox, public listing page
- **Phase 4** — Security, GDPR, backups, production deployment
- **Phase 5** *(optional)* — AI assistance for low-risk text (listing copy, draft
  replies) — never for contracts

See [`PLAN.md`](./PLAN.md) for detailed tasks and milestones.

---

## Contributing

This is an internal project. If the repository is opened up, contribution guidelines
will be added here.

---

## License

To be decided. Add a `LICENSE` file before publishing.
