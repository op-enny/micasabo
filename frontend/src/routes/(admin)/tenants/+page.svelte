<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let showForm = $state(false);
</script>

<svelte:head><title>micasabo · Mieter</title></svelte:head>

<div class="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
  <div>
    <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">VERWALTUNG</p>
    <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">Mieter</h2>
  </div>
  <button class="btn-primary" onclick={() => showForm = !showForm}>
    <span class="material-symbols-outlined text-[20px]">person_add</span>
    Mieter anlegen
  </button>
</div>

{#if showForm}
<div class="card p-6 mb-stack-lg">
  <h3 class="font-headline-sm text-headline-sm mb-6" style="font-family:'Hanken Grotesk',sans-serif">Neuer Mieter</h3>
  <form method="POST" action="?/create" use:enhance>
    {#if form?.error}
      <div class="flex items-center gap-3 p-3 bg-error-container rounded border-l-4 border-error mb-4">
        <span class="material-symbols-outlined text-error text-[20px]">error</span>
        <p class="font-body-sm text-on-error-container">{form.error}</p>
      </div>
    {/if}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
      <div><label class="label">VORNAME</label><input name="vorname" required class="input" /></div>
      <div><label class="label">NACHNAME</label><input name="nachname" required class="input" /></div>
      <div><label class="label">E-MAIL</label><input type="email" name="email" class="input" /></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
      <div><label class="label">TELEFON</label><input name="telefon" class="input" /></div>
      <div><label class="label">GEBURTSDATUM</label><input type="date" name="geburtsdatum" class="input" /></div>
      <div><label class="label">NOTIZEN</label><input name="notizen" class="input" /></div>
    </div>
    <div class="flex gap-3">
      <button type="submit" class="btn-primary">Speichern</button>
      <button type="button" class="btn-secondary" onclick={() => showForm = false}>Abbrechen</button>
    </div>
  </form>
</div>
{/if}

<!-- Search -->
<form method="GET" class="mb-stack-md flex gap-3">
  <div class="relative flex-1 max-w-sm">
    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
    <input name="q" class="input pl-10" placeholder="Nach Name oder E-Mail suchen …" value={data.q} />
  </div>
  <button type="submit" class="btn-secondary">Suchen</button>
</form>

<div class="card overflow-hidden">
  <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
    <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Mieterliste</h3>
    <span class="font-label-caps text-label-caps text-on-surface-variant">{data.tenants.length} EINTRÄGE</span>
  </div>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>NAME</th>
          <th>E-MAIL</th>
          <th>TELEFON</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.tenants as t}
        <tr onclick={() => window.location.href = `/tenants/${t.id}`}>
          <td class="font-semibold text-on-surface">{t.nachname}, {t.vorname}</td>
          <td class="text-on-surface-variant">{t.email ?? '—'}</td>
          <td class="font-label-caps text-label-caps text-on-surface-variant">{t.telefon ?? '—'}</td>
          <td class="text-right">
            <a href="/tenants/{t.id}" class="text-secondary hover:underline font-label-caps text-label-caps" onclick|stopPropagation>ÖFFNEN →</a>
          </td>
        </tr>
        {/each}
        {#if data.tenants.length === 0}
        <tr><td colspan="4" class="text-center py-12 text-on-surface-variant font-body-sm">Keine Mieter vorhanden.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
