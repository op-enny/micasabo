# PROD.md — micasabo

**Produkt:** micasabo — Immobilienverwaltungssystem
**Version:** 1.0
**Status:** Entwurf
**Letzte Aktualisierung:** Juni 2026
**Eigentümer:** [Dein Name / Firma]

---

## 1. Produktvision

**micasabo** ist ein leichtgewichtiges, eigenständiges Immobilienverwaltungssystem
für den internen Gebrauch einer Firma. Jede Verwaltungseinheit läuft in einem eigenen
Docker-Container auf einem VPS. micasabo automatisiert arbeitsintensive, repetitive
Aufgaben der Immobilienverwaltung — zunächst klassisch und regelbasiert, ohne
KI-Agenten. KI bleibt eine optionale, später nachrüstbare Erweiterung.

### Leitprinzipien

| Prinzip | Bedeutung |
|---|---|
| Einfachheit vor Vollständigkeit | Lieber wenige Funktionen, die zuverlässig laufen |
| Single-Tenant | Eine Firma pro Instanz, keine Mandantentrennung im Code |
| Container-first | Neue Verwaltung = neuer Container, isoliert |
| Leichtgewichtig | SQLite statt Postgres, minimaler Ressourcenverbrauch |
| Sicherheit & Datenschutz | DSGVO-konform, verschlüsselte Backups, gehärteter Server |
| Mensch entscheidet | Automatisierung erzeugt Entwürfe, der Betreiber gibt frei |

---

## 2. Zielgruppe & Nutzungskontext

- **Primärer Nutzer:** Der Betreiber (Vermieter / Hausverwalter) — ein einzelner
  Admin-Account pro Instanz.
- **Sekundäre Akteure:** Interessenten (über öffentliche Landingpage, kein Login),
  Mieter (Empfänger von Dokumenten und E-Mails).
- **Kein** Multi-User, **kein** komplexes Rollen-/Rechtekonzept (RBAC).
- Bereitstellung weiterer Instanzen für Dritte erfolgt über separate Container.

---

## 3. Scope

### 3.1 In Scope (Phase 1–4)

- Objektverwaltung (Wohnung, WG mit Subobjekten, Anlage)
- Möblierungsstatus (möbliert / unmöbliert / WG)
- Internet-Flag pro Anlage
- Mieterverwaltung (CRM-leicht)
- Vertragserstellung auf Template-Basis + Versand
- Zahlungs- und Mahnverfolgung (regelbasiert)
- Anfragen-Inbox / Lead-Pipeline
- Instandhaltungsverwaltung
- Öffentliche Angebots-Landingpage
- Authentifizierung, Sicherheit, DSGVO-Funktionen
- Backups (Litestream)

### 3.2 Out of Scope (Phase 1)

- KI-Agenten jeglicher Art
- Multi-Tenant-Infrastruktur
- Komplexe RBAC / Mehrbenutzer
- Mobile App (nur responsive Web)
- Online-Zahlungsabwicklung / Payment-Gateway
- Buchhaltungs-Export (DATEV etc.)

### 3.3 Später optional (Phase 5+)

- KI-gestützte Erstantworten auf Anfragen (als Entwurf)
- KI-Generierung von Listing-Beschreibungen
- KI-Vorschläge für Mahntexte (nur risikoarme Texte)

---

## 4. Objektmodell

### 4.1 Objekttypen

| Typ | Beschreibung | Besonderheit |
|---|---|---|
| `wohnung` | Eigenständige Wohnung | Möbliert / unmöbliert |
| `wg` | WG als Hauptobjekt | Enthält Zimmer als Subobjekte |
| `zimmer` | WG-Zimmer (Subobjekt) | `parent_id` zeigt auf WG; eigene Verwaltung möglich |
| `anlage` | Mehrere Einheiten | `internet_vorhanden`-Flag |

### 4.2 WG-Hierarchie

- Eine WG ist ein Objekt vom Typ `wg`.
- Jedes Zimmer ist ein Objekt vom Typ `zimmer` mit `parent_id` = ID der WG.
- Jedes Zimmer kann eigenständig vermietet, verwaltet und auf der Landingpage
  angeboten werden (eigener Mieter, Vertrag, Zahlungen).
- Gemeinschaftsbereiche werden auf Ebene der WG (Hauptobjekt) definiert.

### 4.3 WG-Vermietungsmodelle (mehrere Mieter pro Objekt)

Das System unterstützt alle drei in Deutschland üblichen WG-Modelle. Grundlage ist
eine Many-to-Many-Beziehung zwischen Verträgen und Mietern (Zwischentabelle
`contract_tenants`), sodass dasselbe Objekt an mehrere Personen vermietet werden kann.

| Modell | Beschreibung | Abbildung im System |
|---|---|---|
| Einzelvermietung pro Zimmer | Jedes Zimmer eigener Vertrag/Mieter | `zimmer`-Objekt + eigener Vertrag |
| Gesamtmietvertrag (echte WG) | Ein Objekt, ein Vertrag, mehrere Mieter, gesamtschuldnerische Haftung | 1 Vertrag + mehrere `contract_tenants` |
| Hauptmieter + Untermieter | Eine Person hat den Vertrag, vermietet weiter | `rolle` = hauptmieter / untermieter |

**Eigenschaften der Zwischentabelle `contract_tenants`:**

- Mehrere Mieter pro Vertrag (dasselbe Objekt an mehrere Personen).
- `rolle` pro Person: hauptmieter / mitmieter / untermieter.
- `gesamtschuldnerisch` (bool): jeder haftet für die volle Miete.
- `mietanteil` (optional): interne Aufteilung pro Person.
- `einzug` / `auszug` pro Person: Mieterwechsel in der WG **ohne** Vertragsende —
  bei Auszug wird nur das `auszug`-Datum gesetzt, ein neuer Eintrag für die
  nachrückende Person angelegt; Vertrag und übrige Mieter bleiben unberührt.
- Aktuelle Belegung = `contract_tenants` mit `auszug IS NULL`.

---

## 5. Funktionale Anforderungen

### 5.1 Objektverwaltung

- Betreiber kann Objekte selbst anlegen, bearbeiten, konfigurieren, archivieren.
- Felder: Typ, Möblierung, Fläche, Zimmeranzahl, Kaltmiete, Nebenkosten,
  Internet-Flag, Adresse, Beschreibung, Status (frei / reserviert / vermietet).
- Foto-Upload pro Objekt.
- Steuerung, ob ein Objekt auf der Landingpage erscheint.

### 5.2 Mieterverwaltung (CRM-leicht)

- Stammdaten, Kontaktdaten, Notizen.
- Zuordnung zu Objekt und Vertrag.
- **WG-Unterstützung:** dasselbe Objekt an mehrere Personen vermietbar; mehrere
  Mieter pro Vertrag über `contract_tenants` (Rolle, Haftung, Mietanteil,
  individueller Ein-/Auszug). Mieterwechsel ohne Vertragsende.
- Kaution-Tracking (erhalten / zurückgezahlt) — pro Person möglich.
- Dokumenten-Upload (Ausweis, Bonität etc.).
- Manuelle Kommunikationshistorie.

### 5.3 Vertragserstellung (Template-basiert, kein KI-Agent)

- Vorlagen als HTML mit Platzhaltern (`{{mieter_name}}`, `{{kaltmiete}}` …).
- Separate Vorlagen je Objekttyp (Wohnung möbliert / unmöbliert / WG-Zimmer).
- Automatische Befüllung aus DB, Vorschau, Bearbeitung durch Betreiber.
- PDF-Generierung (Puppeteer oder WeasyPrint).
- Versand per E-Mail mit PDF-Anhang (SMTP).
- Ablage im Archiv mit Zeitstempel und Status.

### 5.4 Zahlungs- & Mahnverfolgung

- Monatliche Mieteingänge erfassen.
- Offene / überfällige Zahlungen markieren (regelbasiert via Cron).
- Mahnstufen 0–3, manuell oder regelbasiert hochgestuft.
- CSV-Export.

### 5.5 Anfragen-Inbox

- Eingehende Anfragen aus dem Landingpage-Formular.
- Status-Pipeline: Neu → Kontaktiert → Besichtigung → Zugesagt / Abgelehnt.
- Notizen, Zuordnung zu Objekt, manuelle Beantwortung.

### 5.6 Instandhaltung

- Reparaturmeldungen, Handwerker-Kontakte, Status, Kosten, Fotos.

### 5.7 Öffentliche Landingpage

- Automatisch befüllt aus Objektverwaltung (nur Status = frei).
- Filter: Typ, Möblierung, Größe.
- Kontaktformular mit DSGVO-Einwilligung → landet in der Anfragen-Inbox.
- Kein Login für Interessenten.

---

## 6. Nicht-funktionale Anforderungen

### 6.1 Sicherheit

- Passwort-Hash (argon2 / bcrypt), optional TOTP (2FA).
- Session-Cookies (httpOnly, Secure, SameSite=Strict).
- Rate-Limiting auf Login.
- Admin-Bereich nicht öffentlich exponiert.
- HTTPS erzwungen (HSTS).
- Dokumente nur über signierte Routen abrufbar.

### 6.2 Datenschutz (DSGVO)

- Datenschutzerklärung auf Landingpage.
- Pflicht-Einwilligung im Kontaktformular.
- Lösch- und Auskunftsfunktion für personenbezogene Daten.
- Keine Datenweitergabe an Dritte.
- Bei späterer KI-Nutzung: Pseudonymisierung vor externem API-Aufruf.

### 6.3 Betrieb & Infrastruktur

- Docker Compose, Container als non-root.
- Nur Port 80/443 nach außen, Firewall (ufw), Fail2ban.
- SQLite + Litestream (kontinuierliche Backups zu S3-kompatiblem Speicher).
- RAM-Bedarf pro Instanz: ~256–512 MB.
- Unattended-upgrades für OS-Sicherheitspatches.

### 6.4 Performance

- Reaktionszeit Admin-UI < 300 ms bei typischer Last.
- Landingpage-Last gering, statisch cachebar wo möglich.

---

## 7. Technologie-Stack (Empfehlung)

| Schicht | Wahl | Begründung |
|---|---|---|
| Reverse Proxy | Caddy | Automatisches HTTPS, minimale Konfiguration |
| Frontend | SvelteKit | Leichtgewichtig, Admin + Landingpage in einem Build |
| Backend | Hono (Node) **oder** FastAPI (Python) | Schlank, schnell |
| Datenbank | SQLite | Kein externer DB-Server nötig |
| Backup | Litestream → S3 | Kontinuierlich, verschlüsselt |
| Template-Engine | Handlebars / Nunjucks | Platzhalter-Ersetzung für Verträge |
| PDF | Puppeteer / WeasyPrint | HTML → PDF |
| E-Mail | SMTP (eigene Domain) | Versand mit Anhang |
| Cron | Im Backend-Prozess | Fristen, Mahnstatus |
| Monitoring | Uptime Kuma (optional) | Verfügbarkeit |

---

## 8. Datenmodell (Kernentitäten)

- `properties` — Objekte (mit `parent_id` für WG-Zimmer)
- `tenants` — Mieter
- `contracts` — Verträge (mit `miete_gesamt`)
- `contract_tenants` — Zwischentabelle Vertrag↔Mieter (WG-Mehrfachvermietung:
  Rolle, gesamtschuldnerische Haftung, Mietanteil, Ein-/Auszug pro Person)
- `payments` — Zahlungen (optional mit `tenant_id`: wer gezahlt hat)
- `leads` — Anfragen
- `maintenance` — Instandhaltung
- `documents` — Datei-Metadaten
- `property_photos` — Fotos
- `handwerker` — Kontaktbuch
- `settings` — Konfiguration

Vollständiges SQL-Schema wird in Phase 1 erstellt (siehe Plan).

---

## 9. Erfolgskriterien

- Betreiber kann eine neue Verwaltung mit `docker compose up` deployen.
- Ein Objekt anlegen → auf Landingpage anzeigen → Anfrage empfangen → Mieter
  anlegen → Vertrag generieren → versenden: Ende-zu-Ende in unter 10 Minuten.
- Backups laufen automatisch und sind wiederherstellbar (verifiziert).
- Keine personenbezogenen Daten verlassen ungeschützt den Server.

---

## 10. Risiken & Annahmen

| Risiko | Maßnahme |
|---|---|
| SQLite-Limits bei sehr großem Datenvolumen | Für eine Firma unkritisch; bei Bedarf Migration zu Postgres möglich |
| Rechtssicherheit der Vertragsvorlagen | Vorlagen vom Anwalt prüfen lassen; System erzeugt nur Entwürfe |
| E-Mail-Zustellbarkeit (SPF/DKIM) | Eigene Domain korrekt konfigurieren |
| Datenverlust | Litestream + regelmäßige Restore-Tests |
| DSGVO-Verstoß bei KI-Nutzung (später) | Pseudonymisierung, ggf. lokales Modell |
