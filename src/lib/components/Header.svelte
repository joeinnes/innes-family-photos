<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { Logout } from 'svelte-heros';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import Button from '$lib/components/Button.svelte';
	export let admin = false;

	const logOut = async () => {
		await fetch('/api/auth', {
			method: 'POST'
		});
		invalidate('/');
	};
</script>

<header class="header">
	<div class="title">
		<h1>{import.meta.env.VITE_SITE_NAME}</h1>
		<h2>{import.meta.env.VITE_SITE_TAGLINE}</h2>
	</div>
	<div class="action-buttons">
		{#key admin}
			{#if admin}
				<FileUpload />
			{/if}
		{/key}
		<Button clickHandler={logOut} colour="primary" forceText={true}
			><Logout slot="icon" />Log Out</Button
		>
	</div>
</header>

<style lang="scss">
	.header {
		@apply flex flex-col md:flex-row justify-between md:items-center gap-2 w-full;
		.title {
			@apply flex-1;
			h1 {
				@apply text-4xl font-black tracking-wide text-neutral-900 mb-2;
			}
			h2 {
				@apply text-sm uppercase text-neutral-400 font-bold tracking-wide;
			}
		}
		.action-buttons {
			@apply flex md:w-auto gap-2 text-sm md:text-base;
		}
	}
</style>
