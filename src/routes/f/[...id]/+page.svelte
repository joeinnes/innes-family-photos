<script lang="ts">
	import { goto } from '$app/navigation';
	import { selected } from '$lib/stores/selected';
	import Lightbox from '$lib/components/Lightbox.svelte';
	export let id: string;
	if (!id) {
		goto('/');
	} else {
		$selected = id;
	}
</script>

<Lightbox canClose={false} />
