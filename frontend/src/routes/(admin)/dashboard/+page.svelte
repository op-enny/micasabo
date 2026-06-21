<script lang="ts">
  let { data } = $props();
  const occupancyPct = data.total > 0 ? Math.round((data.vermietet / data.total) * 100) : 0;
</script>

<svelte:head><title>micasabo · Portfolio</title></svelte:head>

<!-- Page header -->
<div class="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
  <div>
    <p class="font-label-caps text-label-caps text-on-surface-variant uppercase">ÜBERSICHT</p>
    <h2 class="font-display-lg text-4xl font-bold text-on-surface mt-1" style="font-family:'Hanken Grotesk',sans-serif">Portfolio</h2>
  </div>
  <a href="/properties" class="btn-primary">
    <span class="material-symbols-outlined text-[20px]">add</span>
    Objekt anlegen
  </a>
</div>

<!-- Metrics grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
  <!-- Revenue placeholder -->
  <div class="card p-6 hover:border-secondary transition-all group relative overflow-hidden">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">OBJEKTE GESAMT</p>
        <h3 class="font-headline-md text-headline-md" style="font-family:'Hanken Grotesk',sans-serif">{data.total}</h3>
      </div>
      <span class="material-symbols-outlined text-secondary-container opacity-20 text-4xl group-hover:scale-110 transition-transform">domain</span>
    </div>
    <p class="font-label-caps text-label-caps text-on-surface-variant">{data.frei} frei · {data.vermietet} vermietet</p>
    <div class="absolute bottom-0 left-0 w-full h-0.5 bg-secondary opacity-20"></div>
  </div>

  <!-- Occupancy -->
  <div class="card p-6 hover:border-secondary transition-all group">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">BELEGUNGSQUOTE</p>
        <h3 class="font-headline-md text-headline-md" style="font-family:'Hanken Grotesk',sans-serif">{occupancyPct}%</h3>
      </div>
      <span class="material-symbols-outlined text-tenant-active opacity-20 text-4xl group-hover:scale-110 transition-transform">group</span>
    </div>
    <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
      <div class="bg-tenant-active h-full transition-all" style="width:{occupancyPct}%"></div>
    </div>
    <p class="font-body-sm text-on-surface-variant mt-2">{data.frei} {data.frei === 1 ? 'Einheit' : 'Einheiten'} frei</p>
  </div>

  <!-- Tenants -->
  <div class="card p-6 hover:border-secondary transition-all group">
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">AKTIVE MIETER</p>
        <h3 class="font-headline-md text-headline-md" style="font-family:'Hanken Grotesk',sans-serif">{data.tenantCount}</h3>
      </div>
      <span class="material-symbols-outlined text-secondary opacity-20 text-4xl group-hover:scale-110 transition-transform">person</span>
    </div>
    <a href="/tenants" class="font-label-caps text-label-caps text-secondary hover:underline">MIETER VERWALTEN →</a>
  </div>
</div>

<!-- Quick actions -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
  <div class="lg:col-span-2 flex flex-col gap-gutter">
    <!-- Quick links -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-lowest">
        <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">Schnellzugriff</h3>
      </div>
      <div class="divide-y divide-gray-50">
        {#each [
          { href: '/properties', icon: 'domain',    label: 'Objekte verwalten',     sub: 'Übersicht aller Mietobjekte' },
          { href: '/tenants',    icon: 'group',     label: 'Mieter verwalten',      sub: 'CRM und Mieterverwaltung' },
          { href: '/payments',   icon: 'payments',  label: 'Zahlungen erfassen',    sub: 'Mieteingänge und Mahnwesen' },
          { href: '/maintenance',icon: 'construction', label: 'Instandhaltung',     sub: 'Reparaturen und Handwerker' },
          { href: '/leads',      icon: 'inbox',     label: 'Anfragen-Inbox',        sub: 'Interessenten und Lead-Pipeline' },
        ] as item}
        <a href={item.href} class="p-6 flex items-center gap-4 hover:bg-surface transition-colors group">
          <div class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
            <span class="material-symbols-outlined">{item.icon}</span>
          </div>
          <div class="flex-1">
            <p class="font-body-md font-semibold text-on-surface">{item.label}</p>
            <p class="font-body-sm text-on-surface-variant">{item.sub}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">chevron_right</span>
        </a>
        {/each}
      </div>
    </div>
  </div>

  <!-- Right panel -->
  <div class="flex flex-col gap-gutter">
    <div class="bg-primary text-on-primary rounded-lg p-6 shadow-sm flex flex-col justify-between" style="min-height:220px">
      <div>
        <p class="font-label-caps text-label-caps text-on-primary-container mb-2">PHASE 0–1 ABGESCHLOSSEN</p>
        <h3 class="font-headline-sm text-headline-sm" style="font-family:'Hanken Grotesk',sans-serif">System bereit</h3>
      </div>
      <div class="mt-6">
        <svg class="w-full overflow-visible" height="40" viewBox="0 0 200 40">
          <path d="M0 35 Q 40 30, 80 20 T 160 8 T 200 2" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
          <circle cx="200" cy="2" r="3" fill="#6ffbbe"/>
        </svg>
      </div>
      <p class="font-body-sm mt-4 opacity-70">Phase 2: Verträge & PDF-Generierung folgt.</p>
    </div>

    <div class="card p-6">
      <h4 class="font-headline-sm text-headline-sm mb-4" style="font-family:'Hanken Grotesk',sans-serif">Aufgaben</h4>
      <div class="space-y-3">
        <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded border-l-4 border-secondary">
          <span class="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
          <div>
            <p class="font-body-sm font-semibold">Schema initialisiert</p>
            <p class="text-[12px] text-on-surface-variant">SQLite WAL-Modus aktiv</p>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded border-l-4 border-tertiary">
          <span class="material-symbols-outlined text-tertiary text-[20px]">lock</span>
          <div>
            <p class="font-body-sm font-semibold">Authentifizierung aktiv</p>
            <p class="text-[12px] text-on-surface-variant">argon2 · Session-Cookies</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
