<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  let showForm = $state(false);
  const statusLabel: Record<string,string> = { frei:'Frei', reserviert:'Reserviert', vermietet:'Vermietet' };
  const statusColor: Record<string,string> = { frei:'green', reserviert:'orange', vermietet:'blue' };
</script>

<svelte:head><title>micasabo · Objekte</title></svelte:head>

<div class="header">
  <h1>Objekte</h1>
  <button class="btn" onclick={() => showForm = !showForm}>+ Anlegen</button>
</div>

{#if showForm}
<form method="POST" action="?/create" use:enhance class="create-form">
  {#if form?.error}<p class="err">{form.error}</p>{/if}
  <div class="row">
    <label>Typ<select name="typ" required>
      <option value="wohnung">Wohnung</option>
      <option value="wg">WG</option>
      <option value="zimmer">Zimmer</option>
      <option value="anlage">Anlage</option>
    </select></label>
    <label>Name / Bezeichnung<input name="name" required /></label>
    <label>Status<select name="status">
      <option value="frei">Frei</option>
      <option value="reserviert">Reserviert</option>
      <option value="vermietet">Vermietet</option>
    </select></label>
  </div>
  <div class="row">
    <label>Adresse<input name="adresse" /></label>
    <label>Fläche (m²)<input type="number" step="0.01" name="flaeche_qm" /></label>
    <label>Zimmer<input type="number" step="0.5" name="zimmer_anzahl" /></label>
  </div>
  <div class="row">
    <label>Kaltmiete (€)<input type="number" step="0.01" name="kaltmiete" /></label>
    <label>Nebenkosten (€)<input type="number" step="0.01" name="nebenkosten_pauschal" /></label>
    <label class="check"><input type="checkbox" name="moebliert" /> Möbliert</label>
    <label class="check"><input type="checkbox" name="internet_vorhanden" /> Internet</label>
    <label class="check"><input type="checkbox" name="aktiv_auf_landingpage" /> Auf Landingpage</label>
  </div>
  <div class="actions">
    <button type="submit" class="btn">Speichern</button>
    <button type="button" class="btn-ghost" onclick={() => showForm = false}>Abbrechen</button>
  </div>
</form>
{/if}

<table>
  <thead><tr><th>Name</th><th>Typ</th><th>Adresse</th><th>Miete</th><th>Status</th><th></th></tr></thead>
  <tbody>
    {#each data.properties as p}
    <tr>
      <td><a href="/properties/{p.id}">{p.name}</a></td>
      <td class="typ">{p.typ}</td>
      <td>{p.adresse ?? '—'}</td>
      <td>{p.kaltmiete != null ? `${p.kaltmiete} €` : '—'}</td>
      <td><span class="badge {statusColor[p.status]}">{statusLabel[p.status]}</span></td>
      <td><a href="/properties/{p.id}" class="link">→</a></td>
    </tr>
    {/each}
    {#if data.properties.length === 0}
    <tr><td colspan="6" class="empty">Keine Objekte vorhanden.</td></tr>
    {/if}
  </tbody>
</table>

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
  h1 { margin:0; font-size:1.5rem; }
  .btn { background:#6366f1; color:#fff; border:none; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.9rem; text-decoration:none; }
  .btn:hover { background:#4f46e5; }
  .btn-ghost { background:none; border:1px solid #d4d4d8; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.9rem; }
  .create-form { background:#fff; border:1px solid #e4e4e7; border-radius:10px; padding:1.5rem; margin-bottom:1.5rem; }
  .row { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; }
  label { display:flex; flex-direction:column; gap:.3rem; font-size:.875rem; font-weight:500; color:#3f3f46; flex:1; min-width:140px; }
  label.check { flex-direction:row; align-items:center; gap:.5rem; min-width:auto; }
  input,select { padding:.5rem .65rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.9rem; }
  .actions { display:flex; gap:.75rem; margin-top:.5rem; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem; border-radius:6px; font-size:.875rem; margin-bottom:1rem; }
  table { width:100%; border-collapse:collapse; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  th { text-align:left; padding:.75rem 1rem; font-size:.8rem; color:#71717a; border-bottom:1px solid #e4e4e7; }
  td { padding:.75rem 1rem; border-bottom:1px solid #f4f4f5; font-size:.9rem; }
  .typ { text-transform:capitalize; color:#71717a; }
  .badge { padding:.2rem .6rem; border-radius:999px; font-size:.75rem; font-weight:500; }
  .badge.green { background:#f0fdf4; color:#15803d; }
  .badge.orange { background:#fff7ed; color:#c2410c; }
  .badge.blue { background:#eff6ff; color:#1d4ed8; }
  .link { color:#6366f1; text-decoration:none; }
  .empty { text-align:center; color:#a1a1aa; padding:2rem; }
  a { color:#6366f1; text-decoration:none; }
</style>
