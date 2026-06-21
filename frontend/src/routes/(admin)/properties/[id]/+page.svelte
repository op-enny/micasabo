<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const p = data.property as Record<string,unknown> | null;
</script>

<svelte:head><title>micasabo · {p ? String(p.name) : 'Neues Objekt'}</title></svelte:head>

<div class="breadcrumb"><a href="/properties">Objekte</a> / {p ? String(p.name) : 'Neu'}</div>

{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.success}<p class="ok">Gespeichert.</p>{/if}

<div class="grid">
  <!-- Property form -->
  <section class="card">
    <h2>Stammdaten</h2>
    <form method="POST" action="?/update" use:enhance>
      <div class="row">
        <label>Typ<select name="typ" required>
          {#each ['wohnung','wg','zimmer','anlage'] as t}
            <option value={t} selected={p?.typ === t}>{t}</option>
          {/each}
        </select></label>
        <label>Name<input name="name" required value={p?.name ?? ''} /></label>
        <label>Status<select name="status">
          {#each ['frei','reserviert','vermietet'] as s}
            <option value={s} selected={p?.status === s}>{s}</option>
          {/each}
        </select></label>
      </div>
      <div class="row">
        <label>Adresse<input name="adresse" value={p?.adresse ?? ''} /></label>
        <label>Fläche (m²)<input type="number" step="0.01" name="flaeche_qm" value={p?.flaeche_qm ?? ''} /></label>
        <label>Zimmer<input type="number" step="0.5" name="zimmer_anzahl" value={p?.zimmer_anzahl ?? ''} /></label>
      </div>
      <div class="row">
        <label>Kaltmiete (€)<input type="number" step="0.01" name="kaltmiete" value={p?.kaltmiete ?? ''} /></label>
        <label>Nebenkosten (€)<input type="number" step="0.01" name="nebenkosten_pauschal" value={p?.nebenkosten_pauschal ?? ''} /></label>
      </div>
      <div class="row checks">
        <label class="check"><input type="checkbox" name="moebliert" checked={!!p?.moebliert} /> Möbliert</label>
        <label class="check"><input type="checkbox" name="internet_vorhanden" checked={!!p?.internet_vorhanden} /> Internet</label>
        <label class="check"><input type="checkbox" name="aktiv_auf_landingpage" checked={!!p?.aktiv_auf_landingpage} /> Auf Landingpage</label>
      </div>
      <label class="full">Beschreibung<textarea name="beschreibung" rows="3">{p?.beschreibung ?? ''}</textarea></label>
      <div class="actions">
        <button type="submit" class="btn">Speichern</button>
        {#if p}
        <button formaction="?/archive" class="btn-danger" onclick={() => confirm('Objekt archivieren?')}>Archivieren</button>
        {/if}
      </div>
    </form>
  </section>

  {#if p}
  <!-- Contracts -->
  <section class="card">
    <h2>Verträge</h2>
    {#each data.contracts as c}
    <a href="/contracts/{c.id}" class="contract-row">
      <span>{c.beginn_datum}</span>
      <span>{c.miete_gesamt} € / Monat</span>
      <span class="badge {c.status === 'aktiv' ? 'green' : 'gray'}">{c.status}</span>
    </a>
    {/each}
    <details class="form-toggle">
      <summary>+ Neuen Vertrag anlegen</summary>
      <form method="POST" action="?/addContract" use:enhance class="sub-form">
        <label>Beginn<input type="date" name="beginn_datum" required /></label>
        <label>Gesamtmiete (€)<input type="number" step="0.01" name="miete_gesamt" required /></label>
        <label>Nebenkosten (€)<input type="number" step="0.01" name="nebenkosten" /></label>
        <label class="check"><input type="checkbox" name="unbefristet" checked /> Unbefristet</label>
        <button type="submit" class="btn">Anlegen</button>
      </form>
    </details>
  </section>

  <!-- WG rooms -->
  {#if p.typ === 'wg'}
  <section class="card">
    <h2>Zimmer</h2>
    {#each data.rooms as r}
    <a href="/properties/{r.id}" class="room-row">{r.name} — {r.status}</a>
    {/each}
  </section>
  {/if}

  <!-- Documents -->
  <section class="card">
    <h2>Dokumente</h2>
    {#each data.documents as d}
    <div class="doc-row">{d.dateiname} <span class="size">{d.groesse_bytes ? Math.round(d.groesse_bytes/1024) + ' KB' : ''}</span></div>
    {/each}
    <form method="POST" enctype="multipart/form-data" action="/api/uploads/documents" class="upload-form">
      <input type="hidden" name="property_id" value={p.id} />
      <input type="file" name="file" />
      <button type="submit" class="btn-ghost">Hochladen</button>
    </form>
  </section>
  {/if}
</div>

<style>
  .breadcrumb { font-size:.875rem; color:#71717a; margin-bottom:1.5rem; }
  .breadcrumb a { color:#6366f1; text-decoration:none; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(420px,1fr)); gap:1.25rem; }
  .card { background:#fff; border-radius:10px; padding:1.5rem; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  h2 { margin:0 0 1.25rem; font-size:1rem; }
  .row { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; }
  .checks { align-items:center; }
  label { display:flex; flex-direction:column; gap:.3rem; font-size:.875rem; font-weight:500; color:#3f3f46; flex:1; min-width:130px; }
  label.check { flex-direction:row; align-items:center; gap:.5rem; min-width:auto; }
  label.full { flex:none; width:100%; margin-bottom:1rem; }
  input,select,textarea { padding:.5rem .65rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.9rem; }
  .actions { display:flex; gap:.75rem; flex-wrap:wrap; }
  .btn { background:#6366f1; color:#fff; border:none; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.875rem; }
  .btn:hover { background:#4f46e5; }
  .btn-ghost { background:none; border:1px solid #d4d4d8; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.875rem; }
  .btn-danger { background:#ef4444; color:#fff; border:none; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.875rem; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  .ok  { background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  .contract-row,.room-row { display:flex; gap:1rem; align-items:center; padding:.6rem 0; border-bottom:1px solid #f4f4f5; text-decoration:none; color:inherit; font-size:.9rem; }
  .badge { padding:.2rem .6rem; border-radius:999px; font-size:.75rem; font-weight:500; }
  .badge.green { background:#f0fdf4; color:#15803d; }
  .badge.gray  { background:#f4f4f5; color:#71717a; }
  .doc-row { display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid #f4f4f5; font-size:.875rem; }
  .size { color:#a1a1aa; }
  .upload-form { display:flex; gap:.75rem; align-items:center; margin-top:.75rem; }
  .form-toggle summary { cursor:pointer; font-size:.875rem; color:#6366f1; margin-top:.75rem; }
  .sub-form { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:.75rem; align-items:flex-end; }
  .sub-form label { min-width:120px; }
</style>
