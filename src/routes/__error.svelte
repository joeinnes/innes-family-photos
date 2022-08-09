<script>
	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';

	onMount(() => setTimeout(() => goto('/'), 3500));
</script>

<div class="fixed top-0 bottom-0 flex flex-col justify-center items-start p-2 jtbg w-full">
	<h2 class="text-6xl my-0">404</h2>
	<h1 class="text-8xl">Couldn't find that</h1>
</div>

<style lang="scss">
	.jtbg {
		background-image: url('/404.gif');
		background-position: center right;
		@apply bg-contain bg-no-repeat h-screen;
	}
</style>
