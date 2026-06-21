<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const c = $derived(data.contract as Record<string,unknown>);
  const tenants = $derived((c.tenants ?? []) as Record<string,unknown>[]);
  const activeTenants = $derived(tenants.filter(t => !t.auszug));
  const formerTenants = $derived(tenants.filter(t => t.auszug));
</script>

<svelte:head><title>micasabo · Vertrag #{c.id}</title></svelte:head>

<!-- Breadcrumb -->
<nav class="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant mb-stack-lg">
  <a href="/properties/{c.property_id}" class="hover:text-secondary transition-colors">{String(c.objekt_name).toUpperCase()}</a>
  <span class="material-symbols-outlined text-[14px]">chevron_right</span>
  <span class="text-on-surface">VERTRAG #{c.id}</span>
</nav>

<!-- Page header -->
<div class="mb-stack-lg">
  <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">VERTRAG</p>
  <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">{c.objekt_name}</h2>
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
  <!-- Vertragsdetails -->
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Vertragsdetails</h3>
    </div>
    <dl class="divide-y divide-border-subtle">
      {#each [
        ['Beginn', c.beginn_datum],
        ['Ende', c.ende_datum ?? (c.unbefristet ? 'Unbefristet' : '—')],
        ['Gesamtmiete', c.miete_gesamt != null ? `${c.miete_gesamt} €` : '—'],
        ['Nebenkosten', c.nebenkosten != null ? `${c.nebenkosten} €` : '—'],
        ['Status', c.status],
      ] as [label, value]}
      <div class="flex justify-between items-center px-6 py-3">
        <dt class="font-label-caps text-label-caps text-on-surface-variant">{label.toUpperCase()}</dt>
        <dd class="font-body-sm font-semibold text-on-surface">{value}</dd>
      </div>
      {/each}
    </dl>
  </div>

  <!-- Aktuelle Belegung -->
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Aktuelle Belegung</h3>
      <span class="font-label-caps text-label-caps text-on-surface-variant">{activeTenants.length} PERSON{activeTenants.length !== 1 ? 'EN' : ''}</span>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each activeTenants as ct}
      <div class="px-6 py-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <a href="/tenants/{ct.tenant_id}" class="font-body-sm font-semibold text-secondary hover:underline">{ct.nachname}, {ct.vorname}</a>
            <p class="font-label-caps text-label-caps text-on-surface-variant mt-0.5">{ct.rolle} · Einzug {ct.einzug ?? '?'}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            {#if ct.gesamtschuldnerisch}
            <span class="font-label-caps text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">Gesamtschuldnerisch</span>
            {/if}
            {#if ct.mietanteil}
            <span class="font-label-caps text-label-caps text-on-surface-variant">{ct.mietanteil} € Anteil</span>
            {/if}
          </div>
        </div>
        <details class="mt-2">
          <summary class="font-label-caps text-label-caps text-secondary cursor-pointer hover:underline">AUSZUG ERFASSEN</summary>
          <form method="POST" action="?/recordAuszug" use:enhance class="flex items-end gap-3 mt-3">
            <input type="hidden" name="ct_id" value={ct.id} />
            <div><label class="label">AUSZUGSDATUM</label><input type="date" name="auszug" required class="input" /></div>
            <button type="submit" class="btn-secondary mb-0.5">Speichern</button>
          </form>
        </details>
      </div>
      {/each}
      {#if activeTenants.length === 0}
      <p class="px-6 py-6 text-center font-body-sm text-on-surface-variant">Keine aktiven Mieter.</p>
      {/if}
    </div>
    <div class="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest">
      <details>
        <summary class="font-label-caps text-label-caps text-secondary cursor-pointer hover:underline">+ MIETER HINZUFÜGEN</summary>
        <form method="POST" action="?/addTenant" use:enhance class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div>
            <label class="label">MIETER</label>
            <select name="tenant_id" required class="input">
              {#each data.allTenants as t}
              <option value={t.id}>{t.nachname}, {t.vorname}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="label">ROLLE</label>
            <select name="rolle" class="input">
              <option value="hauptmieter">Hauptmieter</option>
              <option value="mitmieter" selected>Mitmieter</option>
              <option value="untermieter">Untermieter</option>
            </select>
          </div>
          <div><label class="label">EINZUG</label><input type="date" name="einzug" class="input" /></div>
          <div><label class="label">MIETANTEIL (€)</label><input type="number" step="0.01" name="mietanteil" class="input" /></div>
          <div><label class="label">KAUTION (€)</label><input type="number" step="0.01" name="kaution_betrag" class="input" /></div>
          <div class="flex flex-col gap-3 justify-end">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="gesamtschuldnerisch" checked class="rounded border-border-subtle text-secondary w-4 h-4" />
              <span class="font-body-sm text-on-surface">Gesamtschuldnerisch</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="kaution_erhalten" class="rounded border-border-subtle text-secondary w-4 h-4" />
              <span class="font-body-sm text-on-surface">Kaution erhalten</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <button type="submit" class="btn-primary">Hinzufügen</button>
          </div>
        </form>
      </details>
    </div>
  </div>

  <!-- Ehemalige Mieter -->
  {#if formerTenants.length > 0}
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Ehemalige Mieter</h3>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each formerTenants as ct}
      <div class="px-6 py-4 flex items-center justify-between opacity-60">
        <div>
          <a href="/tenants/{ct.tenant_id}" class="font-body-sm font-semibold text-on-surface hover:text-secondary">{ct.nachname}, {ct.vorname}</a>
          <p class="font-label-caps text-label-caps text-on-surface-variant mt-0.5">{ct.einzug ?? '?'} → {ct.auszug}</p>
        </div>
        <span class="badge-ended">AUSGEZOGEN</span>
      </div>
      {/each}
    </div>
  </div>
  {/if}
</div>
