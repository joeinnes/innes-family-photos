<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import Header from '$lib/components/Header.svelte';
	import MonthView from '$lib/components/MonthView.svelte';
	import LogIn from '$lib/components/LogIn.svelte';

	export let auth = false,
		admin = false,
		list = [
			{
				Key: ''
			}
		];
	let password = '';
	let selected = '';
	let shouldDisplay = false;

	interface ImagesMap {
		[month: string]: string[];
	}
	let images: ImagesMap = {};

	$: shouldDisplay = auth;
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

<Splash />

<div class="container mx-auto w-full max-w-full">
	<Header {admin} />
	{#if !shouldDisplay}
		<LogIn />
	{:else if !Object.keys(images).length}
		<h2>No photos uploaded!</h2>
	{:else}
		{#each Object.keys(images).sort().reverse() as month}
			<MonthView images={images[month]} {month} />
		{/each}
	{/if}
</div>

<Lightbox
	{admin}
	close={() => {
		selected = '';
	}}
/>

<style lang="scss">
	.container {
		@apply p-2 w-full;
	}
</style>
