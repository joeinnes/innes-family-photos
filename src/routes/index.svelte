<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import MonthView from '$lib/components/MonthView.svelte';
	import LogIn from '$lib/components/LogIn.svelte';
	import { authStatus } from '$lib/stores/authStatus';
	import type { AuthStatus } from '$lib/stores/authStatus';

	export let auth: AuthStatus = null;
	export let list = [
		{
			Key: ''
		}
	];

	let shouldDisplay = false;

	interface ImagesMap {
		[month: string]: string[];
	}
	let images: ImagesMap = {};

	$: if (auth) {
		shouldDisplay = true;
		$authStatus = auth;
	}
	$: {
		list.forEach((el) => {
			let month = el.Key.substring(0, 7);
			let fileName = el.Key.substring(8);
			if (images[month]) {
				if (!images[month].includes(fileName)) {
					images[month] = [...images[month], fileName];
				}
			} else {
				images[month] = [fileName];
			}
		});
	}
</script>

{#if !shouldDisplay}
	<LogIn />
{:else if !Object.keys(images).length}
	<h2>No photos uploaded!</h2>
{:else}
	{#each Object.keys(images).sort().reverse() as month}
		<MonthView images={images[month]} {month} />
	{/each}
{/if}

<Lightbox />
