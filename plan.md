# PLAN.md — micasabo · Entwicklungsplan mit Phasen & Milestones

**Projekt:** micasabo — Immobilienverwaltungssystem
**Ansatz:** Klassische, regelbasierte Verwaltung zuerst — KI optional und später.
**Methodik:** Iterativ, jede Phase liefert einen lauffähigen, deploybaren Stand.

---

## Übersicht der Phasen

| Phase | Titel | Ziel | Geschätzter Aufwand* |
|---|---|---|---|
| 0 | Fundament & Setup | Lauffähiges Gerüst, Container, DB | 1 Woche |
| 1 | Objekt- & Mieterverwaltung | Kern-CRUD, WG-Hierarchie | 2 Wochen |
| 2 | Verträge & Dokumente | Template-Engine, PDF, Versand | 2 Wochen |
| 3 | Zahlungen & Anfragen | Mahnwesen, Lead-Pipeline, Landingpage | 2 Wochen |
| 4 | Sicherheit, DSGVO & Betrieb | Härtung, Backups, Deployment | 1–2 Wochen |
| 5 | Optional: KI-Erweiterung | Agent-Layer für risikoarme Texte | offen |

*Grobschätzung für eine Einzelperson in Teilzeit. Anzupassen an deine Kapazität.

---

## Phase 0 — Fundament & Setup

**Ziel:** Ein leeres, aber lauffähiges System, das im Container startet.

### Aufgaben
- [ ] Repository-Struktur anlegen (Monorepo: `frontend/`, `backend/`, `infra/`)
- [ ] Docker-Compose-Grundgerüst (Caddy, Frontend, Backend, Volumes)
- [ ] SQLite-Anbindung + Migrations-Setup
- [ ] Backend-Grundgerüst mit Health-Check-Endpunkt
- [ ] Frontend-Grundgerüst mit Login-Seite (noch ohne Logik)
- [ ] `.env`-Konzept für Secrets (DB-Pfad, SMTP, S3)
- [ ] Caddy-HTTPS lokal testen (selbstsigniert) / produktiv (Let's Encrypt)

### Milestone 0
> `docker compose up` startet alle Container, Health-Check antwortet, Login-Seite
> ist über HTTPS erreichbar.

---

## Phase 1 — Objekt- & Mieterverwaltung

**Ziel:** Der Betreiber kann Objekte und Mieter vollständig verwalten.

### Aufgaben
- [ ] Vollständiges SQLite-Schema (`properties`, `tenants`, `documents`,
      `property_photos`, `settings`)
- [ ] Authentifizierung (Login, Session-Cookie, Passwort-Hash)
- [ ] CRUD Objekte: anlegen, bearbeiten, archivieren
- [ ] Objekttypen inkl. Möblierung & Internet-Flag
- [ ] WG-Hierarchie: WG als Hauptobjekt, Zimmer als Subobjekte (`parent_id`)
- [ ] Foto-Upload + Anzeige
- [ ] CRUD Mieter inkl. Kaution-Tracking
- [ ] Zuordnung Mieter ↔ Objekt
- [ ] **WG-Mehrfachvermietung:** Zwischentabelle `contract_tenants`
      (mehrere Mieter pro Vertrag, Rolle, Haftung, Mietanteil, Ein-/Auszug)
- [ ] Logik "aktuelle Belegung" (`auszug IS NULL`)
- [ ] Mieterwechsel ohne Vertragsende
- [ ] Dokumenten-Upload pro Mieter/Objekt

### Milestone 1
> Betreiber legt eine WG mit zwei Zimmern an, weist jedem Zimmer einen eigenen
> Mieter zu, lädt Fotos und ein Dokument hoch — alles persistiert in SQLite.
> Zusätzlich: ein Objekt wird per Gesamtmietvertrag an drei Personen vermietet
> (gesamtschuldnerisch); eine Person zieht aus, eine neue rückt nach, ohne dass
> der Vertrag endet.

---

## Phase 2 — Verträge & Dokumente

**Ziel:** Verträge aus Vorlagen erzeugen, als PDF versenden, archivieren.

### Aufgaben
- [ ] Schema `contracts` (+ Felder für Dokumentpfad, `versendet_am`, Status,
      `miete_gesamt`)
- [ ] Mehrmieter-Verträge berücksichtigen (`contract_tenants`): alle Parteien
      eines Gesamtmietvertrags im Vertrag und in der Vorlage abbilden
- [ ] Template-Engine einbinden (Handlebars / Nunjucks)
- [ ] Vorlagen erstellen: Wohnung möbliert, Wohnung unmöbliert, WG-Zimmer,
      WG-Gesamtmietvertrag (mehrere Mieter, gesamtschuldnerische Klausel)
- [ ] Platzhalter-Mapping aus DB-Feldern (inkl. Liste aller Mitmieter)
- [ ] Vorschau-Ansicht im Admin-UI (befüllt, editierbar)
- [ ] PDF-Generierung (Puppeteer / WeasyPrint)
- [ ] SMTP-Versand mit PDF-Anhang + Standard-Anschreiben (an alle Mietparteien)
- [ ] Archivierung + Statusverfolgung des versendeten Vertrags
- [ ] Endpunkte: `POST /contracts/generate`, `POST /contracts/:id/send`

### Milestone 2
> Betreiber wählt Vorlage + Mieter + Objekt, prüft die Vorschau, erzeugt das PDF
> und versendet es per E-Mail. Der Vertrag liegt mit Zeitstempel im Archiv.
> Bei einem WG-Gesamtmietvertrag erscheinen alle Mitmieter korrekt im Dokument
> und erhalten den Vertrag per E-Mail.

---

## Phase 3 — Zahlungen, Anfragen & Landingpage

**Ziel:** Zahlungsverfolgung, Lead-Management und öffentliche Angebotsseite.

### Aufgaben
- [ ] Schema `payments`, `leads`, `maintenance`, `handwerker`
- [ ] Mieteingänge erfassen, offene/überfällige Markierung
- [ ] Cron-Job: täglich Fälligkeiten prüfen, Mahnstufen vorschlagen
- [ ] Mahnstufen 0–3, CSV-Export
- [ ] Anfragen-Inbox mit Status-Pipeline
- [ ] Instandhaltung: Meldungen, Status, Kosten, Fotos
- [ ] Öffentliche Landingpage: Angebote (Status = frei), Filter
- [ ] Kontaktformular mit DSGVO-Einwilligung → Anfragen-Inbox
- [ ] Automatische Spiegelung Objektstatus → Landingpage

### Milestone 3
> Ein Objekt erscheint auf der Landingpage, ein Interessent sendet eine Anfrage,
> diese landet in der Inbox; eine überfällige Zahlung wird vom Cron markiert.

---

## Phase 4 — Sicherheit, DSGVO & Betrieb

**Ziel:** Produktionsreife, gehärtet, mit verlässlichen Backups.

### Aufgaben
- [ ] Optional TOTP (2FA) für Admin-Login
- [ ] Rate-Limiting auf sensible Routen
- [ ] HSTS, sichere Cookie-Flags, signierte Dokument-URLs
- [ ] DSGVO: Lösch- und Auskunftsfunktion (Export als JSON)
- [ ] Zugriffslog / Audit-Log
- [ ] Litestream-Backup zu S3-kompatiblem Speicher einrichten
- [ ] Restore-Test dokumentieren und durchführen
- [ ] Server-Härtung: ufw, Fail2ban, unattended-upgrades, non-root Container
- [ ] Deployment-Anleitung (neue Instanz = neuer Container + Subdomain)
- [ ] Optional: Uptime Kuma für Monitoring

### Milestone 4
> Eine Instanz läuft produktiv unter eigener Domain mit gültigem Zertifikat,
> automatischen verschlüsselten Backups und erfolgreich getestetem Restore.

---

## Phase 5 — Optional: KI-Erweiterung (später)

**Ziel:** Risikoarme Textautomatisierung als separater, abschaltbarer Container.
**Voraussetzung:** Phasen 1–4 stabil im Betrieb.

### Aufgaben (bei Bedarf)
- [ ] Schema `agent_drafts` (Entwürfe mit Status entwurf/freigegeben/verworfen)
- [ ] Agent-Service als separater Container (spricht nur über REST-API)
- [ ] Review-Queue im Admin-UI ("Wartet auf Freigabe")
- [ ] Use Case: Listing-Beschreibung generieren (Vorschlag)
- [ ] Use Case: Erstantwort auf Anfrage als Entwurf
- [ ] Pseudonymisierung vor externem LLM-Aufruf (oder lokales Ollama-Modell)
- [ ] n8n-Workflows (bereits verfügbar) als Orchestrierungs-Layer nutzen

### Milestone 5
> Ein Agent erzeugt einen Entwurf (z. B. Listing-Text), der Betreiber prüft und
> gibt frei — keine automatische Aktion ohne menschliche Bestätigung.

> **Bewusst ausgeschlossen:** KI-Generierung von Mietverträgen. Verträge bleiben
> regelbasiert (Template-Engine), da rechtlich relevant und auditpflichtig.

---

## Querschnittsaufgaben (laufend in allen Phasen)

- [ ] Migrationen versioniert halten
- [ ] Kurze README pro Modul
- [ ] Manuelle Test-Checkliste je Milestone
- [ ] Secrets nie im Repo (`.env` + `.gitignore`)
- [ ] Vor jedem Deploy: Backup verifizieren

---

## Priorisierung auf einen Blick

1. **Muss zuerst:** Phasen 0–2 (Fundament, Objekte/Mieter, Verträge) — das ist
   der Kern deines Nutzens (Vertrag erstellen & versenden).
2. **Danach:** Phase 3 (Zahlungen, Anfragen, Landingpage).
3. **Vor Produktivbetrieb mit echten Daten:** Phase 4 (Sicherheit, DSGVO, Backups)
   — nicht überspringen, sobald personenbezogene Daten im Spiel sind.
4. **Optional, später:** Phase 5 (KI).
