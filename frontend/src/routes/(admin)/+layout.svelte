<script lang="ts">
  import { page } from '$app/stores';
  let { children, data } = $props();

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/properties', label: 'Objekte' },
    { href: '/tenants', label: 'Mieter' },
  ];
</script>

<div class="shell">
  <aside>
    <div class="logo">micasabo</div>
    <nav>
      {#each nav as item}
        <a href={item.href} class:active={$page.url.pathname.startsWith(item.href)}>
          {item.label}
        </a>
      {/each}
    </nav>
    <div class="footer">
      <span>{data.user.email}</span>
      <form method="POST" action="/logout">
        <button type="submit">Abmelden</button>
      </form>
    </div>
  </aside>
  <main>
    {@render children()}
  </main>
</div>

<style>
  .shell { display:flex; min-height:100vh; font-family:system-ui,sans-serif; }
  aside { width:220px; background:#18181b; color:#e4e4e7; display:flex; flex-direction:column; padding:1.5rem 1rem; gap:1rem; flex-shrink:0; }
  .logo { font-size:1.25rem; font-weight:700; color:#fff; padding:.5rem 0; }
  nav { display:flex; flex-direction:column; gap:.25rem; flex:1; }
  nav a { color:#a1a1aa; text-decoration:none; padding:.5rem .75rem; border-radius:6px; font-size:.9rem; }
  nav a:hover, nav a.active { background:#27272a; color:#fff; }
  .footer { font-size:.8rem; color:#71717a; display:flex; flex-direction:column; gap:.5rem; }
  .footer button { background:none; border:none; color:#71717a; cursor:pointer; text-align:left; padding:0; font-size:.8rem; }
  .footer button:hover { color:#fff; }
  main { flex:1; padding:2rem; background:#fafafa; overflow:auto; }
</style>
