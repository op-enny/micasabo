<script lang="ts">
  import { enhance } from '$app/forms';
  let { form }: { form?: { error?: string } | null } = $props();
</script>

<svelte:head><title>micasabo · Anmelden</title></svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center px-container-margin-mobile">
  <div class="w-full max-w-sm">
    <!-- Logo / Brand -->
    <div class="mb-10">
      <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Immobilienverwaltung</p>
      <h1 class="font-display-lg text-4xl font-bold text-on-surface" style="font-family:'Hanken Grotesk',sans-serif">micasabo</h1>
    </div>

    <div class="card p-8">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-6" style="font-family:'Hanken Grotesk',sans-serif">Anmelden</h2>

      <form method="POST" use:enhance class="space-y-5">
        {#if form?.error}
          <div class="flex items-center gap-3 p-3 bg-error-container rounded border-l-4 border-error">
            <span class="material-symbols-outlined text-error text-[20px]">error</span>
            <p class="text-body-sm text-on-error-container">{form.error}</p>
          </div>
        {/if}

        <div>
          <label class="label" for="email">E-MAIL</label>
          <input id="email" class="input" type="email" name="email" required autocomplete="username" placeholder="admin@beispiel.de" />
        </div>

        <div>
          <label class="label" for="password">PASSWORT</label>
          <input id="password" class="input" type="password" name="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn-primary w-full justify-center mt-2">
          <span class="material-symbols-outlined text-[18px]">login</span>
          Anmelden
        </button>
      </form>
    </div>

    <p class="text-center text-body-sm text-on-surface-variant mt-6">
      micasabo · Einzelinstanz-Verwaltungssystem
    </p>
  </div>
</div>
