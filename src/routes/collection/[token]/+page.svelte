<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	onMount(() => {
		if ($page.url.searchParams.get('redirect')) {
			goto($page.url.searchParams.get('redirect') || '');
		} else {
			goto('/');
		}
	});
</script>

<section class="prose"><h1>Validating...</h1></section>
