<script lang="ts">
	import { notify } from '$lib/stores/notify';
	import { User } from 'svelte-heros';
	import Button from '$lib/components/Button.svelte';

	let password = '';
	const submitPassword = async () => {
		try {
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer ' + password
				}
			});
			if (res.status === 200) {
				window.location.reload();
			} else {
				$notify = {
					active: true,
					heading: 'Log in failed',
					message: 'The password was not correct',
					colour: 'negative'
				};
			}
		} catch (e) {
			console.log(e);
		}
	};
</script>

<form
	on:submit|preventDefault={submitPassword}
	class="fixed top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center p-4"
	style="background-image: url({import.meta.env.VITE_SPLASH_BG ||
		'https://source.unsplash.com/random'}); background-size: cover;"
>
	<div class="backdrop-blur p-8 border-8 border-white backdrop-brightness-50 flex flex-col">
		<h1 class="text-white text-4xl md:4xl font-black my-0">This site is password protected</h1>
		<input
			type="password"
			bind:value={password}
			class="border rounded w-full my-6 px-2 md:px-6 py-1 md:py-4 text-4xl bg-opacity-50"
			required
		/>
		<div class="text-2xl font-bold flex justify-center">
			<Button type="submit" colour="primary" forceText={true}><User slot="icon" />Log In</Button>
		</div>
	</div>
</form>
