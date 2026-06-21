<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const t = $derived(data.tenant as Record<string,unknown>);
</script>

<svelte:head><title>micasabo · {t.nachname}, {t.vorname}</title></svelte:head>

<!-- Breadcrumb -->
<nav class="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant mb-stack-lg">
  <a href="/tenants" class="hover:text-secondary transition-colors">MIETER</a>
  <span class="material-symbols-outlined text-[14px]">chevron_right</span>
  <span class="text-on-surface">{String(t.nachname).toUpperCase()}, {String(t.vorname).toUpperCase()}</span>
</nav>

<!-- Page header -->
<div class="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
  <div>
    <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">MIETER</p>
    <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">{t.nachname}, {t.vorname}</h2>
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
      <div class="grid grid-cols-2 gap-gutter">
        <div><label class="label">VORNAME</label><input name="vorname" required class="input" value={t.vorname ?? ''} /></div>
        <div><label class="label">NACHNAME</label><input name="nachname" required class="input" value={t.nachname ?? ''} /></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div><label class="label">E-MAIL</label><input type="email" name="email" class="input" value={t.email ?? ''} /></div>
        <div><label class="label">TELEFON</label><input name="telefon" class="input" value={t.telefon ?? ''} /></div>
        <div><label class="label">GEBURTSDATUM</label><input type="date" name="geburtsdatum" class="input" value={t.geburtsdatum ?? ''} /></div>
      </div>
      <div>
        <label class="label">NOTIZEN</label>
        <textarea name="notizen" rows="3" class="input">{t.notizen ?? ''}</textarea>
      </div>
      <div class="pt-2">
        <button type="submit" class="btn-primary">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Speichern
        </button>
      </div>
    </form>
  </div>

  <!-- Verträge & Belegung -->
  <div class="card overflow-hidden">
    <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
      <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Verträge & Belegung</h3>
      <span class="font-label-caps text-label-caps text-on-surface-variant">{data.contracts.length} EINTRÄGE</span>
    </div>
    <div class="divide-y divide-border-subtle">
      {#each data.contracts as c}
      <div class="px-6 py-4 flex items-start justify-between">
        <div>
          <a href="/properties/{c.property_id}" class="font-body-sm font-semibold text-secondary hover:underline">{c.objekt_name}</a>
          <p class="font-label-caps text-label-caps text-on-surface-variant mt-1">{c.rolle} · seit {c.einzug ?? '?'}{c.auszug ? ` bis ${c.auszug}` : ' (aktiv)'}</p>
        </div>
        <span class="{c.auszug ? 'badge-ended' : 'badge-active'}">{c.auszug ? 'AUSGEZOGEN' : 'AKTIV'}</span>
      </div>
      {/each}
      {#if data.contracts.length === 0}
      <p class="px-6 py-8 text-center font-body-sm text-on-surface-variant">Keine Verträge vorhanden.</p>
      {/if}
    </div>
  </div>
</div>
