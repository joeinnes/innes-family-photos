<script>
	import '../app.css';
	import { notify } from '$lib/stores/notify';
	import Notifier from '$lib/components/Notifier.svelte';
</script>

<svelte:head><title>{import.meta.env.VITE_SITE_NAME}</title></svelte:head>
<slot />
<Notifier />
