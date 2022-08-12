<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { selected } from '$lib/stores/selected';
	import { MenuAlt2, ViewGrid } from 'svelte-heros';
	import Image from './Image.svelte';
	export let images: string[];
	export let month = '';
	let title = '';
	let grid = false;
	let root: HTMLElement;
	let loaded = false;
	const getMonthTitle = (month: string) => {
		try {
			return new Date(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
		} catch (e) {
			return 'Error';
		}
	};
	const preload = (src: string) => {
		return new Promise(function (resolve, reject) {
			let img = new Image();
			img.onload = resolve;
			img.src = src;
			img.onerror = reject;
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
					{#await preload(imgUrl)}
						<div
							class="flex justify-center items-center w-full h-64 aspect-video animate-pulse bg-gray-300 rounded dark:bg-gray-700"
							class:aspect-square={grid}
						>
							<svg
								class="w-12 h-12 text-gray-200"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 640 512"
								><path
									d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"
								/></svg
							>
						</div>
					{:then _}
						<div>
							<img
								src={imgUrl}
								class="cursor-pointer"
								alt={imgUrl}
								on:click={() => ($selected = `${month}/${imageKey}`)}
								transition:fly={{ y: 50, duration: 200 }}
							/>
						</div>
					{:catch}
						<div
							class="flex justify-center items-center w-full h-64 aspect-video  bg-red-300 rounded"
							class:aspect-square={grid}
						>
							<svg
								class="w-12 h-12 text-gray-200"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 640 512"
								><path
									d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"
								/></svg
							>
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
				@apply hover:bg-primary-100 transition-colors cursor-pointer flex flex-col items-center justify-center rounded-full w-8 h-8;
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
