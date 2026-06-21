<script lang="ts">
  import { enhance } from '$app/forms';
  let { form }: { form?: { error?: string } | null } = $props();
</script>

<svelte:head><title>micasabo · Anmelden</title></svelte:head>

<main>
  <div class="box">
    <h1>micasabo</h1>
    <p class="sub">Immobilienverwaltung</p>
    <form method="POST" use:enhance>
      {#if form?.error}
        <p class="err">{form.error}</p>
      {/if}
      <label>E-Mail<input type="email" name="email" required autocomplete="username" /></label>
      <label>Passwort<input type="password" name="password" required autocomplete="current-password" /></label>
      <button type="submit">Anmelden</button>
    </form>
  </div>
</main>

<style>
  main { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f4f4f5; font-family:system-ui,sans-serif; }
  .box { background:#fff; padding:2.5rem; border-radius:10px; box-shadow:0 2px 16px rgba(0,0,0,.08); width:100%; max-width:380px; }
  h1 { margin:0 0 .25rem; font-size:1.75rem; }
  .sub { margin:0 0 2rem; color:#71717a; font-size:.9rem; }
  label { display:flex; flex-direction:column; gap:.3rem; margin-bottom:1rem; font-size:.875rem; font-weight:500; color:#3f3f46; }
  input { padding:.6rem .75rem; border:1px solid #d4d4d8; border-radius:6px; font-size:1rem; }
  input:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.15); }
  button { width:100%; padding:.7rem; background:#6366f1; color:#fff; border:none; border-radius:6px; font-size:1rem; cursor:pointer; margin-top:.5rem; }
  button:hover { background:#4f46e5; }
  .err { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:.6rem .75rem; border-radius:6px; font-size:.875rem; margin-bottom:1rem; }
</style>
