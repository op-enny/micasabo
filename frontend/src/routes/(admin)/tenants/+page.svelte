<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let showForm = $state(false);
</script>

<svelte:head><title>micasabo · Mieter</title></svelte:head>

<div class="header">
  <h1>Mieter</h1>
  <button class="btn" onclick={() => showForm = !showForm}>+ Anlegen</button>
</div>

{#if showForm}
<form method="POST" action="?/create" use:enhance class="create-form">
  {#if form?.error}<p class="err">{form.error}</p>{/if}
  <div class="row">
    <label>Vorname<input name="vorname" required /></label>
    <label>Nachname<input name="nachname" required /></label>
    <label>E-Mail<input type="email" name="email" /></label>
  </div>
  <div class="row">
    <label>Telefon<input name="telefon" /></label>
    <label>Geburtsdatum<input type="date" name="geburtsdatum" /></label>
    <label>Notizen<input name="notizen" /></label>
  </div>
  <div class="actions">
    <button type="submit" class="btn">Speichern</button>
    <button type="button" class="btn-ghost" onclick={() => showForm = false}>Abbrechen</button>
  </div>
</form>
{/if}

<form method="GET" class="search">
  <input name="q" placeholder="Nach Name oder E-Mail suchen …" value={data.q} />
  <button type="submit" class="btn-ghost">Suchen</button>
</form>

<table>
  <thead><tr><th>Name</th><th>E-Mail</th><th>Telefon</th><th></th></tr></thead>
  <tbody>
    {#each data.tenants as t}
    <tr>
      <td><a href="/tenants/{t.id}">{t.nachname}, {t.vorname}</a></td>
      <td>{t.email ?? '—'}</td>
      <td>{t.telefon ?? '—'}</td>
      <td><a href="/tenants/{t.id}" class="link">→</a></td>
    </tr>
    {/each}
    {#if data.tenants.length === 0}
    <tr><td colspan="4" class="empty">Keine Mieter vorhanden.</td></tr>
    {/if}
  </tbody>
</table>

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
  h1 { margin:0; font-size:1.5rem; }
  .btn { background:#6366f1; color:#fff; border:none; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.9rem; }
  .btn:hover { background:#4f46e5; }
  .btn-ghost { background:none; border:1px solid #d4d4d8; padding:.55rem 1.1rem; border-radius:6px; cursor:pointer; font-size:.9rem; }
  .create-form { background:#fff; border:1px solid #e4e4e7; border-radius:10px; padding:1.5rem; margin-bottom:1.5rem; }
  .row { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; }
  label { display:flex; flex-direction:column; gap:.3rem; font-size:.875rem; font-weight:500; color:#3f3f46; flex:1; min-width:150px; }
  input { padding:.5rem .65rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.9rem; }
  .actions { display:flex; gap:.75rem; }
  .search { display:flex; gap:.75rem; margin-bottom:1.25rem; }
  .search input { flex:1; padding:.55rem .75rem; border:1px solid #d4d4d8; border-radius:6px; font-size:.9rem; }
  table { width:100%; border-collapse:collapse; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  th { text-align:left; padding:.75rem 1rem; font-size:.8rem; color:#71717a; border-bottom:1px solid #e4e4e7; }
  td { padding:.75rem 1rem; border-bottom:1px solid #f4f4f5; font-size:.9rem; }
  .link { color:#6366f1; text-decoration:none; }
  .empty { text-align:center; color:#a1a1aa; padding:2rem; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem; border-radius:6px; margin-bottom:1rem; }
  a { color:#6366f1; text-decoration:none; }
</style>
