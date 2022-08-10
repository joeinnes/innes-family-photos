<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { selected } from '$lib/stores/selected';
	import { MenuAlt2, ViewGrid } from 'svelte-heros';
	export let images: string[];
	export let month = '';
	let title = '';
	let grid = true;
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

{#if title !== 'Invalid Date'}
	<section bind:this={root} class="month">
		<div class="month-header">
			<h3>{title}</h3>
			<div class="button">
				<ViewGrid on:click={() => (grid = true)} />
			</div>
			<div class="button">
				<MenuAlt2 on:click={() => (grid = false)} />
			</div>
		</div>
		<div class="gallery not-prose" class:gallery-grid={grid}>
			{#if loaded}
				{#each images as imageKey}
					{@const imgUrl = `/file/${month}/${imageKey}`}

					{#await preload(imgUrl) then _}
						<div>
							<img
								src={imgUrl}
								class="cursor-pointer"
								alt={imgUrl}
								on:click={() => ($selected = `${month}/${imageKey}`)}
								transition:fly={{ y: 50, duration: 200 }}
							/>
						</div>
					{/await}
				{/each}
			{/if}
		</div>
	</section>
{/if}

<style lang="scss">
	.month {
		@apply my-4;

		.month-header {
			@apply flex gap-2;
			h3 {
				@apply tracking-wide inline-block border-b-4 border-b-primary-300 text-xl font-bold uppercase mr-2;
			}
			.button {
				@apply hover:bg-primary-100 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center rounded-full w-8 h-8;
			}
		}

		.gallery {
			@apply my-4 gap-4 flex flex-wrap;
			&::after {
				content: '';
				flex-grow: 999999999;
			}
			div {
				@apply w-full md:w-auto flex-grow;
				img {
					vertical-align: bottom;
					@apply h-64 min-w-full max-w-full flex-1 flex-grow transform cursor-pointer rounded-2xl bg-neutral-400 object-cover transition-transform;
				}
			}
		}

		.gallery.gallery-grid {
			@apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4;
			div {
				@apply aspect-square h-full w-full;
				img {
					@apply h-full w-auto object-cover;
				}
			}
		}
	}
</style>
