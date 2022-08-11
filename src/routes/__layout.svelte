<script>
	import '../app.css';
	import { notify } from '$lib/stores/notify';
	import Notifier from '$lib/components/Notifier.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head><title>{import.meta.env.VITE_SITE_NAME}</title></svelte:head>
<div class="mx-auto w-full min-h-screen flex flex-col">
	<Header />
	<div class="app-container">
		<slot />
	</div>
	<Notifier />
	<Footer />
</div>

<style lang="scss">
	.app-container {
		@apply p-2 container mx-auto w-full flex-1;
	}
</style>
