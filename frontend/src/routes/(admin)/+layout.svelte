<script lang="ts">
  import { page } from '$app/stores';
  let { children, data } = $props();

  const nav = [
    { href: '/dashboard',  icon: 'analytics',     label: 'Portfolio' },
    { href: '/properties', icon: 'domain',         label: 'Objekte' },
    { href: '/tenants',    icon: 'group',          label: 'Mieter' },
    { href: '/payments',   icon: 'payments',       label: 'Zahlungen' },
    { href: '/maintenance',icon: 'construction',   label: 'Instandhaltung' },
    { href: '/leads',      icon: 'inbox',          label: 'Anfragen' },
  ];

  let sidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-background">
  <!-- Top App Bar -->
  <header class="bg-white border-b border-border-subtle sticky top-0 z-40">
    <div class="flex items-center justify-between h-16 px-container-margin-mobile md:px-container-margin-desktop">
      <div class="flex items-center gap-stack-md">
        <button onclick={() => sidebarOpen = !sidebarOpen} class="md:hidden p-2 hover:bg-surface-container-low rounded transition-colors">
          <span class="material-symbols-outlined text-on-surface">menu</span>
        </button>
        <h1 class="font-headline-sm text-headline-sm font-bold text-on-surface" style="font-family:'Hanken Grotesk',sans-serif">micasabo</h1>
      </div>
      <div class="flex items-center gap-stack-md">
        <span class="font-label-caps text-label-caps text-on-surface-variant hidden md:block">{data.user.email}</span>
        <form method="POST" action="/logout">
          <button type="submit" class="p-2 hover:bg-surface-container-low rounded transition-colors" title="Abmelden">
            <span class="material-symbols-outlined text-on-surface-variant">logout</span>
          </button>
        </form>
      </div>
    </div>
  </header>

  <div class="flex">
    <!-- Sidebar Desktop -->
    <aside class="hidden md:flex h-[calc(100vh-64px)] w-64 sticky top-16 bg-white border-r border-border-subtle flex-col py-4 gap-1 flex-shrink-0">
      <div class="px-6 mb-6">
        <p class="font-headline-sm text-headline-sm font-semibold text-on-surface" style="font-family:'Hanken Grotesk',sans-serif">{data.user.email.split('@')[0]}</p>
        <p class="font-label-caps text-label-caps text-secondary uppercase mt-1">Administrator</p>
      </div>
      <nav class="flex flex-col gap-0.5 px-2">
        {#each nav as item}
          <a
            href={item.href}
            class="flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all duration-150 text-body-md
              {$page.url.pathname.startsWith(item.href)
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low'}"
          >
            <span class="material-symbols-outlined text-[22px]">{item.icon}</span>
            {item.label}
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Mobile sidebar overlay -->
    {#if sidebarOpen}
    <div class="md:hidden fixed inset-0 z-50 flex">
      <div class="w-64 bg-white border-r border-border-subtle flex flex-col py-4 gap-1 shadow-lg">
        <div class="px-6 mb-6">
          <p class="font-headline-sm text-headline-sm font-semibold text-on-surface" style="font-family:'Hanken Grotesk',sans-serif">micasabo</p>
        </div>
        <nav class="flex flex-col gap-0.5 px-2">
          {#each nav as item}
            <a href={item.href} onclick={() => sidebarOpen = false}
              class="flex items-center gap-stack-md px-4 py-3 rounded-lg transition-all
                {$page.url.pathname.startsWith(item.href)
                  ? 'bg-surface-container text-on-surface font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'}">
              <span class="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </a>
          {/each}
        </nav>
      </div>
      <div class="flex-1 bg-black/40" onclick={() => sidebarOpen = false}></div>
    </div>
    {/if}

    <!-- Main content -->
    <main class="flex-1 px-container-margin-mobile md:px-container-margin-desktop py-stack-lg pb-24 md:pb-stack-lg overflow-x-hidden">
      {@render children()}
    </main>
  </div>

  <!-- Bottom nav mobile -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white border-t border-border-subtle z-40">
    {#each nav.slice(0,4) as item}
      <a href={item.href}
        class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
          {$page.url.pathname.startsWith(item.href) ? 'text-secondary' : 'text-on-surface-variant'}">
        <span class="material-symbols-outlined text-[22px]">{item.icon}</span>
        <span class="font-label-caps text-[10px] uppercase">{item.label}</span>
      </a>
    {/each}
  </nav>
</div>
