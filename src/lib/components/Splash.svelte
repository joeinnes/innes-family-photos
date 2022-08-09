<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	let display = true;
	let width = 0,
		height = 0;
	let bg = '';
	onMount(() => {
		display = false;
	});
	$: {
		if (height && width) {
			bg = `https://source.unsplash.com/random?h=${height}&w=${width}&q=50&fit=crop&auto=compress,enhance,format`;
		}
	}
</script>

{#if display}
	<div
		class="fixed top-0 left-0 bottom-0 right-0 flex flex-col items-center justify-center z-30 p-4 bg-black"
		style="background-image: url({import.meta.env.VITE_SPLASH_BG ||
			'https://source.unsplash.com/random'}); background-size: cover;"
		out:fade={{ delay: 1500, duration: 500 }}
		bind:clientHeight={height}
		bind:clientWidth={width}
	>
		<div class="md:w-auto backdrop-blur p-8 border-8 border-white backdrop-brightness-50">
			<h1 class="text-white text-6xl md:text-8xl font-black my-0">
				{import.meta.env.VITE_SITE_NAME}
			</h1>
			<p class="text-white text-4xl my-2">{import.meta.env.VITE_SITE_TAGLINE}</p>
		</div>
	</div>
{/if}
