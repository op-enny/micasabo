<script lang="ts">
  let { data } = $props();
</script>

<svelte:head><title>micasabo · Dashboard</title></svelte:head>

<h1>Dashboard</h1>
<div class="cards">
  <div class="card"><span class="num">{data.total}</span><span class="lbl">Objekte gesamt</span></div>
  <div class="card green"><span class="num">{data.vermietet}</span><span class="lbl">Vermietet</span></div>
  <div class="card blue"><span class="num">{data.frei}</span><span class="lbl">Frei</span></div>
  <div class="card"><span class="num">{data.tenantCount}</span><span class="lbl">Mieter</span></div>
</div>
<div class="quick">
  <a href="/properties/new" class="btn">+ Objekt anlegen</a>
  <a href="/tenants/new" class="btn">+ Mieter anlegen</a>
</div>

<style>
  h1 { margin:0 0 1.5rem; font-size:1.5rem; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; margin-bottom:2rem; }
  .card { background:#fff; border-radius:10px; padding:1.25rem; display:flex; flex-direction:column; gap:.25rem; box-shadow:0 1px 4px rgba(0,0,0,.07); }
  .card.green { border-left:4px solid #22c55e; }
  .card.blue  { border-left:4px solid #6366f1; }
  .num { font-size:2rem; font-weight:700; }
  .lbl { font-size:.8rem; color:#71717a; }
  .quick { display:flex; gap:1rem; }
  .btn { background:#6366f1; color:#fff; padding:.6rem 1.25rem; border-radius:6px; text-decoration:none; font-size:.9rem; }
  .btn:hover { background:#4f46e5; }
</style>
