<script>
	import { page } from '$app/stores';
	import LogIn from '$lib/components/LogIn.svelte';
	let shouldLogIn = false;

	$: {
		if ($page.status === 401) {
			shouldLogIn = true;
		}
	}
</script>

{#if shouldLogIn}
	{#await setTimeout(() => {}, 3500) then _}
		<LogIn />
	{/await}
{/if}
<div class="fixed top-0 bottom-0 flex flex-col justify-center items-start p-2 jtbg w-full -z-10">
	<h2 class="text-6xl my-0">{$page.status}</h2>
	<h1 class="text-8xl">{$page.error?.message ?? 'Something went wrong'}</h1>
</div>

<style lang="scss">
	.jtbg {
		background-image: url('/404.gif');
		background-position: center right;
		@apply bg-contain bg-no-repeat h-screen;
	}
</style>
