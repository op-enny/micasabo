<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let showForm = $state(false);

  const statusBadge: Record<string,string> = {
    frei:       'badge-vacant',
    reserviert: 'badge-reserved',
    vermietet:  'badge-occupied',
  };
  const statusLabel: Record<string,string> = {
    frei: 'FREI', reserviert: 'RESERVIERT', vermietet: 'VERMIETET'
  };
</script>

<svelte:head><title>micasabo · Objekte</title></svelte:head>

<div class="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
  <div>
    <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">VERWALTUNG</p>
    <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">Objekte</h2>
  </div>
  <button class="btn-primary" onclick={() => showForm = !showForm}>
    <span class="material-symbols-outlined text-[20px]">add</span>
    Objekt anlegen
  </button>
</div>

{#if showForm}
<div class="card p-6 mb-stack-lg">
  <h3 class="font-headline-sm text-headline-sm mb-6" style="font-family:'Hanken Grotesk',sans-serif">Neues Objekt</h3>
  <form method="POST" action="?/create" use:enhance>
    {#if form?.error}
      <div class="flex items-center gap-3 p-3 bg-error-container rounded border-l-4 border-error mb-4">
        <span class="material-symbols-outlined text-error text-[20px]">error</span>
        <p class="font-body-sm text-on-error-container">{form.error}</p>
      </div>
    {/if}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
      <div>
        <label class="label">TYP</label>
        <select name="typ" required class="input">
          <option value="wohnung">Wohnung</option>
          <option value="wg">WG</option>
          <option value="zimmer">Zimmer</option>
          <option value="anlage">Anlage</option>
        </select>
      </div>
      <div>
        <label class="label">BEZEICHNUNG</label>
        <input name="name" required class="input" placeholder="z. B. Musterstr. 1, Whg. 2" />
      </div>
      <div>
        <label class="label">STATUS</label>
        <select name="status" class="input">
          <option value="frei">Frei</option>
          <option value="reserviert">Reserviert</option>
          <option value="vermietet">Vermietet</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-md">
      <div class="md:col-span-2">
        <label class="label">ADRESSE</label>
        <input name="adresse" class="input" placeholder="Straße, PLZ Stadt" />
      </div>
      <div>
        <label class="label">FLÄCHE (M²)</label>
        <input type="number" step="0.01" name="flaeche_qm" class="input" placeholder="65.5" />
      </div>
      <div>
        <label class="label">ZIMMER</label>
        <input type="number" step="0.5" name="zimmer_anzahl" class="input" placeholder="2.5" />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
      <div>
        <label class="label">KALTMIETE (€)</label>
        <input type="number" step="0.01" name="kaltmiete" class="input" placeholder="800.00" />
      </div>
      <div>
        <label class="label">NEBENKOSTEN (€)</label>
        <input type="number" step="0.01" name="nebenkosten_pauschal" class="input" placeholder="150.00" />
      </div>
    </div>
    <div class="flex flex-wrap gap-6 mb-6">
      {#each [['moebliert','Möbliert'],['internet_vorhanden','Internet inklusive'],['aktiv_auf_landingpage','Auf Landingpage anzeigen']] as [name, lbl]}
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {name} class="rounded border-border-subtle text-secondary focus:ring-secondary/20 w-4 h-4" />
        <span class="font-body-sm text-on-surface">{lbl}</span>
      </label>
      {/each}
    </div>
    <div class="flex gap-3">
      <button type="submit" class="btn-primary">Speichern</button>
      <button type="button" class="btn-secondary" onclick={() => showForm = false}>Abbrechen</button>
    </div>
  </form>
</div>
{/if}

<!-- Table -->
<div class="card overflow-hidden">
  <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
    <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Alle Objekte</h3>
    <span class="font-label-caps text-label-caps text-on-surface-variant">{data.properties.length} EINTRÄGE</span>
  </div>
  <div class="overflow-x-auto">
    <table class="data-table">
      <thead>
        <tr>
          <th>OBJEKT</th>
          <th>TYP</th>
          <th>ADRESSE</th>
          <th>KALTMIETE</th>
          <th>STATUS</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.properties as p}
        <tr onclick={() => window.location.href = `/properties/${p.id}`}>
          <td class="font-semibold text-on-surface">{p.name}</td>
          <td class="font-label-caps text-label-caps text-on-surface-variant uppercase">{p.typ}</td>
          <td class="text-on-surface-variant">{p.adresse ?? '—'}</td>
          <td class="font-label-caps text-label-caps">{p.kaltmiete != null ? `${p.kaltmiete.toFixed(2)} €` : '—'}</td>
          <td><span class="{statusBadge[p.status]}">{statusLabel[p.status]}</span></td>
          <td class="text-right">
            <a href="/properties/{p.id}" class="text-secondary hover:underline font-label-caps text-label-caps" onclick|stopPropagation>ÖFFNEN →</a>
          </td>
        </tr>
        {/each}
        {#if data.properties.length === 0}
        <tr><td colspan="6" class="text-center py-12 text-on-surface-variant font-body-sm">Keine Objekte vorhanden. Legen Sie Ihr erstes Objekt an.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
