<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/images/favicon.svg" />
</svelte:head>

{@render children()}
