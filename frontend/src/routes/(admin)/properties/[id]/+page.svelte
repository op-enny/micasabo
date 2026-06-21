<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const p = $derived(data.property as Record<string,unknown> | null);

  const statusBadge: Record<string,string> = {
    frei: 'badge-vacant', reserviert: 'badge-reserved', vermietet: 'badge-occupied',
  };
  const statusLabel: Record<string,string> = {
    frei: 'FREI', reserviert: 'RESERVIERT', vermietet: 'VERMIETET',
  };
</script>

<svelte:head><title>micasabo · {p ? String(p.name) : 'Objekt'}</title></svelte:head>

<!-- Breadcrumb -->
<nav class="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant mb-stack-lg">
  <a href="/properties" class="hover:text-secondary transition-colors">OBJEKTE</a>
  <span class="material-symbols-outlined text-[14px]">chevron_right</span>
  <span class="text-on-surface">{p ? String(p.name) : 'NEU'}</span>
</nav>

<!-- Page header -->
<div class="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
  <div>
    <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">VERWALTUNG</p>
    <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">{p ? String(p.name) : 'Neues Objekt'}</h2>
    {#if p}<span class="{statusBadge[String(p.status)]} mt-2 inline-block">{statusLabel[String(p.status)]}</span>{/if}
  </div>
</div>

{#if form?.error}
<div class="flex items-center gap-3 p-3 bg-error-container rounded border-l-4 border-error mb-stack-md">
  <span class="material-symbols-outlined text-error text-[20px]">error</span>
  <p class="font-body-sm text-on-error-container">{form.error}</p>
</div>
{/if}
{#if form?.success}
<div class="flex items-center gap-3 p-3 bg-surface-container rounded border-l-4 border-tertiary mb-stack-md">
  <span class="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
  <p class="font-body-sm text-on-surface">Gespeichert.</p>
</div>
{/if}

<div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
  <!-- Stammdaten -->
  <div class="card p-6">
    <h3 class="font-headline-sm text-headline-sm mb-6" style="font-family:'Hanken Grotesk',sans-serif">Stammdaten</h3>
    <form method="POST" action="?/update" use:enhance class="space-y-stack-md">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div>
          <label class="label">TYP</label>
          <select name="typ" required class="input">
            {#each ['wohnung','wg','zimmer','anlage'] as t}
              <option value={t} selected={p?.typ === t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="label">BEZEICHNUNG</label>
          <input name="name" required class="input" value={p?.name ?? ''} />
        </div>
        <div>
          <label class="label">STATUS</label>
          <select name="status" class="input">
            {#each ['frei','reserviert','vermietet'] as s}
              <option value={s} selected={p?.status === s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="md:col-span-1">
          <label class="label">ADRESSE</label>
          <input name="adresse" class="input" value={p?.adresse ?? ''} />
        </div>
        <div>
          <label class="label">FLÄCHE (M²)</label>
          <input type="number" step="0.01" name="flaeche_qm" class="input" value={p?.flaeche_qm ?? ''} />
        </div>
        <div>
          <label class="label">ZIMMER</label>
          <input type="number" step="0.5" name="zimmer_anzahl" class="input" value={p?.zimmer_anzahl ?? ''} />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div>
          <label class="label">KALTMIETE (€)</label>
          <input type="number" step="0.01" name="kaltmiete" class="input" value={p?.kaltmiete ?? ''} />
        </div>
        <div>
          <label class="label">NEBENKOSTEN (€)</label>
          <input type="number" step="0.01" name="nebenkosten_pauschal" class="input" value={p?.nebenkosten_pauschal ?? ''} />
        </div>
      </div>
      <div class="flex flex-wrap gap-6">
        {#each [['moebliert','Möbliert'],['internet_vorhanden','Internet inklusive'],['aktiv_auf_landingpage','Auf Landingpage']] as [name, lbl]}
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {name} checked={!!p?.[name]} class="rounded border-border-subtle text-secondary focus:ring-secondary/20 w-4 h-4" />
          <span class="font-body-sm text-on-surface">{lbl}</span>
        </label>
        {/each}
      </div>
      <div>
        <label class="label">BESCHREIBUNG</label>
        <textarea name="beschreibung" rows="3" class="input">{p?.beschreibung ?? ''}</textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-primary">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Speichern
        </button>
        {#if p}
        <button formaction="?/archive" class="btn-danger" onclick={() => confirm('Objekt archivieren?')}>
          <span class="material-symbols-outlined text-[18px]">archive</span>
          Archivieren
        </button>
        {/if}
      </div>
    </form>
  </div>

  {#if p}
  <!-- Verträge -->
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Verträge</h3>
      <span class="font-label-caps text-label-caps text-on-surface-variant">{data.contracts.length} EINTRÄGE</span>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each data.contracts as c}
      <a href="/contracts/{c.id}" class="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group">
        <div>
          <p class="font-body-sm font-semibold text-on-surface">ab {c.beginn_datum}</p>
          <p class="font-label-caps text-label-caps text-on-surface-variant">{c.miete_gesamt} € / Monat</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="{c.status === 'aktiv' ? 'badge-active' : 'badge-ended'}">{c.status === 'aktiv' ? 'AKTIV' : 'BEENDET'}</span>
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">chevron_right</span>
        </div>
      </a>
      {/each}
      {#if data.contracts.length === 0}
      <p class="px-6 py-8 text-center font-body-sm text-on-surface-variant">Keine Verträge vorhanden.</p>
      {/if}
    </div>
    <div class="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest">
      <details>
        <summary class="font-label-caps text-label-caps text-secondary cursor-pointer hover:underline">+ NEUEN VERTRAG ANLEGEN</summary>
        <form method="POST" action="?/addContract" use:enhance class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div><label class="label">BEGINN</label><input type="date" name="beginn_datum" required class="input" /></div>
          <div><label class="label">GESAMTMIETE (€)</label><input type="number" step="0.01" name="miete_gesamt" required class="input" /></div>
          <div><label class="label">NEBENKOSTEN (€)</label><input type="number" step="0.01" name="nebenkosten" class="input" /></div>
          <div class="flex items-end pb-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="unbefristet" checked class="rounded border-border-subtle text-secondary w-4 h-4" />
              <span class="font-body-sm text-on-surface">Unbefristet</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <button type="submit" class="btn-primary">Anlegen</button>
          </div>
        </form>
      </details>
    </div>
  </div>

  <!-- WG Zimmer -->
  {#if p.typ === 'wg'}
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Zimmer</h3>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each data.rooms as r}
      <a href="/properties/{r.id}" class="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group">
        <span class="font-body-sm font-semibold text-on-surface">{r.name}</span>
        <div class="flex items-center gap-3">
          <span class="badge-{r.status === 'vermietet' ? 'occupied' : r.status === 'reserviert' ? 'reserved' : 'vacant'}">{r.status.toUpperCase()}</span>
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">chevron_right</span>
        </div>
      </a>
      {/each}
    </div>
  </div>
  {/if}

  <!-- Dokumente -->
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Dokumente</h3>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each data.documents as d}
      <div class="flex items-center justify-between px-6 py-3">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]">description</span>
          <span class="font-body-sm text-on-surface">{d.dateiname}</span>
        </div>
        <span class="font-label-caps text-label-caps text-on-surface-variant">{d.groesse_bytes ? Math.round(d.groesse_bytes/1024) + ' KB' : ''}</span>
      </div>
      {/each}
      {#if data.documents.length === 0}
      <p class="px-6 py-6 text-center font-body-sm text-on-surface-variant">Keine Dokumente hochgeladen.</p>
      {/if}
    </div>
    <div class="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest">
      <form method="POST" enctype="multipart/form-data" action="/api/uploads/documents" class="flex items-center gap-3">
        <input type="hidden" name="property_id" value={p.id} />
        <input type="file" name="file" class="font-body-sm text-on-surface-variant" />
        <button type="submit" class="btn-secondary">
          <span class="material-symbols-outlined text-[18px]">upload</span>
          Hochladen
        </button>
      </form>
    </div>
  </div>
  {/if}
</div>
