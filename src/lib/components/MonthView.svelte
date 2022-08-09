<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { selected } from '$lib/stores/selected';
	export let images: string[];
	export let month = '';
	let title = '';
	let root: HTMLDivElement;
	let loaded = false;
	const getMonthTitle = (month: string) => {
		try {
			return new Date(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
		} catch (e) {
			return 'Error';
		}
	};
	const preload = (src: string) => {
		return new Promise(function (resolve) {
			let img = new Image();
			img.onload = resolve;
			img.src = src;
		});
	};
	let observer: IntersectionObserver;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						loaded = true;
						observer.disconnect();
					}
				});
			},
			{ threshold: 0, root: null, rootMargin: '0px' }
		);
		observer.observe(root);
	});

	onDestroy(() => {
		observer?.disconnect();
	});
	$: title = getMonthTitle(month);
</script>

<div bind:this={root}>
	{#if title !== 'Invalid Date'}
		<h3>{title}</h3>
		<div
			class="gallery not-prose
"
		>
			{#if loaded}
				{#each images as imageKey}
					{@const imgUrl = `/file/${month}/${imageKey}`}

					{#await preload(imgUrl) then _}
						<div>
							<img
								src={imgUrl}
								class="image cursor-pointer"
								alt={imgUrl}
								on:click={() => ($selected = `${month}/${imageKey}`)}
								transition:fly={{ y: 50, duration: 200 }}
							/>
						</div>
					{/await}
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.gallery {
		/* @apply py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full grid-flow-row-dense gap-2 lg:gap-4;*/
		@apply flex flex-wrap gap-2;
		&::after {
			content: '';
			flex-grow: 999999999;
		}
		div {
			@apply flex-grow;
		}
		.image {
			vertical-align: bottom;
			@apply h-96 flex-grow object-cover max-w-full min-w-full;
		}
	}
</style>
