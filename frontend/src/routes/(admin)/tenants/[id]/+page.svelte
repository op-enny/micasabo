<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const t = $derived(data.tenant as Record<string,unknown>);
</script>

<svelte:head><title>micasabo · {t.nachname}, {t.vorname}</title></svelte:head>

<div class="breadcrumb"><a href="/tenants">Mieter</a> / {t.nachname}, {t.vorname}</div>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.success}<p class="ok">Gespeichert.</p>{/if}

<div class="grid">
  <section class="card">
    <h2>Stammdaten</h2>
    <form method="POST" action="?/update" use:enhance>
      <div class="row">
        <label>Vorname<input name="vorname" required value={t.vorname ?? ''} /></label>
        <label>Nachname<input name="nachname" required value={t.nachname ?? ''} /></label>
      </div>
      <div class="row">
        <label>E-Mail<input type="email" name="email" value={t.email ?? ''} /></label>
        <label>Telefon<input name="telefon" value={t.telefon ?? ''} /></label>
        <label>Geburtsdatum<input type="date" name="geburtsdatum" value={t.geburtsdatum ?? ''} /></label>
      </div>
      <label class="full">Notizen<textarea name="notizen" rows="3">{t.notizen ?? ''}</textarea></label>
      <button type="submit" class="btn">Speichern</button>
    </form>
  </section>

  <section class="card">
    <h2>Verträge & Belegung</h2>
    {#each data.contracts as c}
    <div class="contract-row">
      <div>
        <a href="/properties/{c.property_id}">{c.objekt_name}</a>
        <span class="meta">{c.rolle} · seit {c.einzug ?? '?'}{c.auszug ? ` bis ${c.auszug}` : ' (aktiv)'}</span>
      </div>
      <span class="badge {c.auszug ? 'gray' : 'green'}">{c.auszug ? 'ausgezogen' : 'aktiv'}</span>
    </div>
    {/each}
    {#if data.contracts.length === 0}
    <p class="empty">Keine Verträge.</p>
    {/if}
  </section>
</div>

<style>
  .breadcrumb { font-size:.875rem; color:#71717a; margin-bottom:1.5rem; }
  .breadcrumb a { color:#6366f1; text-decoration:none; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:1.25rem; }
  .card { background:#fff; border-radius:10px; padding:1.5rem; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  h2 { margin:0 0 1.25rem; font-size:1rem; }
  .row { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; }
  label { display:flex; flex-direction:column; gap:.3rem; font-size:.875rem; font-weight:500; color:#3f3f46; flex:1; min-width:150px; }
  label.full { flex:none; width:100%; margin-bottom:1rem; }
  input,textarea { padding:.5rem .65rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.9rem; }
  .btn { background:#6366f1; color:#fff; border:none; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.875rem; }
  .btn:hover { background:#4f46e5; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  .ok  { background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  .contract-row { display:flex; justify-content:space-between; align-items:flex-start; padding:.75rem 0; border-bottom:1px solid #f4f4f5; }
  .meta { display:block; font-size:.8rem; color:#71717a; margin-top:.2rem; }
  .badge { padding:.2rem .6rem; border-radius:999px; font-size:.75rem; font-weight:500; }
  .badge.green { background:#f0fdf4; color:#15803d; }
  .badge.gray  { background:#f4f4f5; color:#71717a; }
  .empty { color:#a1a1aa; font-size:.9rem; }
  a { color:#6366f1; text-decoration:none; }
</style>
