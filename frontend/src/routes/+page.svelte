<script lang="ts">
  import { enhance } from '$app/forms';
  let { form }: { form?: { error?: string } | null } = $props();
</script>

<svelte:head>
  <title>micasabo · Login</title>
</svelte:head>

<main>
  <div class="login-box">
    <h1>micasabo</h1>
    <p class="subtitle">Immobilienverwaltung</p>

    <form method="POST" use:enhance>
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
      <label>
        E-Mail
        <input type="email" name="email" required autocomplete="username" />
      </label>
      <label>
        Passwort
        <input type="password" name="password" required autocomplete="current-password" />
      </label>
      <button type="submit">Anmelden</button>
    </form>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f5f5f5;
    font-family: system-ui, sans-serif;
  }
  .login-box {
    background: white;
    padding: 2.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,.1);
    width: 100%;
    max-width: 380px;
  }
  h1 {
    margin: 0 0 .25rem;
    font-size: 1.75rem;
  }
  .subtitle {
    margin: 0 0 2rem;
    color: #666;
    font-size: .9rem;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: .35rem;
    margin-bottom: 1rem;
    font-size: .9rem;
    font-weight: 500;
  }
  input {
    padding: .6rem .75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  input:focus {
    outline: none;
    border-color: #4f6ef7;
    box-shadow: 0 0 0 3px rgba(79,110,247,.15);
  }
  button {
    width: 100%;
    padding: .7rem;
    background: #4f6ef7;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: .5rem;
  }
  button:hover { background: #3a57e0; }
  .error {
    background: #fff0f0;
    border: 1px solid #ffcccc;
    color: #c00;
    padding: .6rem .75rem;
    border-radius: 4px;
    font-size: .875rem;
    margin-bottom: 1rem;
  }
</style>
