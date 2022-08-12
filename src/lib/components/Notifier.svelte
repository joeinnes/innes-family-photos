<script lang="ts">
	import { fly } from 'svelte/transition';
	import { notify } from '$lib/stores/notify';
	export let colour = 'primary';

	interface ColourMap {
		[key: string]: string;
	}

	const colours: ColourMap = {
		primary: 'bg-primary-100 text-primary-700',
		success: 'bg-green-100 text-green-700',
		negative: 'bg-red-100 text-red-700'
	};
	$: {
		colour = $notify.colour;
	}
</script>

{#if $notify.active}
	<div
		class="fixed bottom-5 right-5 bg-white py-2 px-4 rounded w-64 flex gap-4 items-center"
		transition:fly={{ y: 200, duration: 200 }}
	>
		{#if $notify.icon}
			<div
				class="{colours[colour]} rounded h-12 w-auto aspect-square flex items-center justify-center"
			>
				<svelte:component this={$notify.icon} />
			</div>
		{/if}
		<div>
			{#if $notify.heading}
				<h3 class="my-0">{$notify.heading}</h3>
			{/if}

			<p class="my-0">{$notify.message || ''}</p>
		</div>
	</div>
{/if}
