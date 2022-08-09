<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { User } from 'svelte-heros';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import Button from '$lib/components/Button.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import Header from '$lib/components/Header.svelte';
	import MonthView from '$lib/components/MonthView.svelte';

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

	const submitPassword = async () => {
		try {
			await fetch('/api/auth', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer ' + password
				}
			});
			await invalidate('/');
		} catch (e) {
			console.log(e);
		}
	};

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
		<form
			on:submit|preventDefault={submitPassword}
			class="fixed top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center p-4"
			style="background-image: url({import.meta.env.VITE_SPLASH_BG ||
				'https://source.unsplash.com/random'}); background-size: cover;"
		>
			<div class="backdrop-blur p-8 border-8 border-white backdrop-brightness-50 flex flex-col">
				<h1 class="text-white text-4xl md:4xl font-bold my-0">This site is password protected</h1>
				<input
					type="password"
					bind:value={password}
					class="border rounded w-full my-6 px-2 md:px-6 py-1 md:py-4 text-4xl bg-opacity-50"
					required
				/>
				<Button type="submit" colour="primary" forceText={true}><User slot="icon" />Log In</Button>
			</div>
		</form>
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
