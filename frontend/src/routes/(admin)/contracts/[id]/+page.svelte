<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const c = $derived(data.contract as Record<string,unknown>);
  const tenants = $derived((c.tenants ?? []) as Record<string,unknown>[]);
  const activeTenants = $derived(tenants.filter(t => !t.auszug));
</script>

<svelte:head><title>micasabo · Vertrag {c.id}</title></svelte:head>

<div class="breadcrumb">
  <a href="/properties/{c.property_id}">{c.objekt_name}</a> / Vertrag #{c.id}
</div>

{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.success}<p class="ok">Gespeichert.</p>{/if}

<div class="grid">
  <!-- Contract details -->
  <section class="card">
    <h2>Vertragsdetails</h2>
    <div class="kv"><span>Beginn</span><strong>{c.beginn_datum}</strong></div>
    <div class="kv"><span>Ende</span><strong>{c.ende_datum ?? (c.unbefristet ? 'unbefristet' : '—')}</strong></div>
    <div class="kv"><span>Gesamtmiete</span><strong>{c.miete_gesamt} €</strong></div>
    <div class="kv"><span>Nebenkosten</span><strong>{c.nebenkosten} €</strong></div>
    <div class="kv"><span>Status</span><strong>{c.status}</strong></div>
  </section>

  <!-- Active occupancy -->
  <section class="card">
    <h2>Aktuelle Belegung ({activeTenants.length} Person{activeTenants.length !== 1 ? 'en' : ''})</h2>
    {#each activeTenants as ct}
    <div class="tenant-row">
      <div class="info">
        <a href="/tenants/{ct.tenant_id}">{ct.nachname}, {ct.vorname}</a>
        <span class="meta">{ct.rolle} · Einzug {ct.einzug ?? '?'}</span>
        {#if ct.gesamtschuldnerisch}<span class="badge blue">gesamtschuldnerisch</span>{/if}
        {#if ct.mietanteil}<span class="meta">{ct.mietanteil} € Anteil</span>{/if}
      </div>
      <details class="auszug-form">
        <summary class="link">Auszug erfassen</summary>
        <form method="POST" action="?/recordAuszug" use:enhance class="inline-form">
          <input type="hidden" name="ct_id" value={ct.id} />
          <input type="date" name="auszug" required />
          <button type="submit" class="btn-sm">Speichern</button>
        </form>
      </details>
    </div>
    {/each}

    <!-- Add tenant to contract -->
    <details class="form-toggle">
      <summary>+ Mieter hinzufügen</summary>
      <form method="POST" action="?/addTenant" use:enhance class="sub-form">
        <label>Mieter<select name="tenant_id" required>
          {#each data.allTenants as t}
          <option value={t.id}>{t.nachname}, {t.vorname}</option>
          {/each}
        </select></label>
        <label>Rolle<select name="rolle">
          <option value="hauptmieter">Hauptmieter</option>
          <option value="mitmieter" selected>Mitmieter</option>
          <option value="untermieter">Untermieter</option>
        </select></label>
        <label>Einzug<input type="date" name="einzug" /></label>
        <label>Mietanteil (€)<input type="number" step="0.01" name="mietanteil" /></label>
        <label>Kaution (€)<input type="number" step="0.01" name="kaution_betrag" /></label>
        <label class="check"><input type="checkbox" name="gesamtschuldnerisch" checked /> Gesamtschuldnerisch</label>
        <label class="check"><input type="checkbox" name="kaution_erhalten" /> Kaution erhalten</label>
        <button type="submit" class="btn">Hinzufügen</button>
      </form>
    </details>
  </section>

  <!-- History (moved-out) -->
  {#if tenants.some(t => t.auszug)}
  <section class="card">
    <h2>Ehemalige Mieter</h2>
    {#each tenants.filter(t => t.auszug) as ct}
    <div class="tenant-row muted">
      <div class="info">
        <a href="/tenants/{ct.tenant_id}">{ct.nachname}, {ct.vorname}</a>
        <span class="meta">{ct.einzug ?? '?'} → {ct.auszug}</span>
      </div>
    </div>
    {/each}
  </section>
  {/if}
</div>

<style>
  .breadcrumb { font-size:.875rem; color:#71717a; margin-bottom:1.5rem; }
  .breadcrumb a { color:#6366f1; text-decoration:none; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:1.25rem; }
  .card { background:#fff; border-radius:10px; padding:1.5rem; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  h2 { margin:0 0 1.25rem; font-size:1rem; }
  .kv { display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid #f4f4f5; font-size:.9rem; }
  .kv span { color:#71717a; }
  .tenant-row { padding:.75rem 0; border-bottom:1px solid #f4f4f5; }
  .tenant-row.muted { opacity:.6; }
  .info a { font-size:.95rem; color:#6366f1; text-decoration:none; font-weight:500; }
  .meta { display:block; font-size:.8rem; color:#71717a; margin-top:.15rem; }
  .badge { padding:.15rem .5rem; border-radius:999px; font-size:.72rem; font-weight:500; margin-left:.4rem; }
  .badge.blue { background:#eff6ff; color:#1d4ed8; }
  .form-toggle summary { cursor:pointer; font-size:.875rem; color:#6366f1; margin-top:.75rem; }
  .sub-form { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:.75rem; align-items:flex-end; }
  label { display:flex; flex-direction:column; gap:.3rem; font-size:.875rem; font-weight:500; color:#3f3f46; }
  label.check { flex-direction:row; align-items:center; gap:.5rem; }
  select,input[type=date],input[type=number] { padding:.45rem .65rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.875rem; }
  .btn { background:#6366f1; color:#fff; border:none; padding:.5rem 1rem; border-radius:6px; cursor:pointer; font-size:.875rem; }
  .btn:hover { background:#4f46e5; }
  .btn-sm { background:#6366f1; color:#fff; border:none; padding:.35rem .75rem; border-radius:6px; cursor:pointer; font-size:.8rem; }
  .link { cursor:pointer; font-size:.8rem; color:#6366f1; margin-top:.4rem; }
  .auszug-form { margin-top:.35rem; }
  .auszug-form summary { list-style:none; }
  .inline-form { display:flex; gap:.5rem; align-items:center; margin-top:.5rem; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  .ok  { background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
</style>
