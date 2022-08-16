<script lang="ts">
	import { fly } from 'svelte/transition';

	import Button from '$lib/components/Button.svelte';
	import { notify } from '$lib/stores/notify';
	import { invalidate } from '$app/navigation';
	import { Link, Trash, XCircle } from 'svelte-heros';

	let creating = false;
	type MagicLinkType = 'persist' | 'temp';
	interface MagicLink {
		link: string;
		type: MagicLinkType;
	}
	export let magicLinks: MagicLink[] = [];
	let deleting = false;

	const createMagicLink = async (type: MagicLinkType) => {
		creating = true;
		try {
			await fetch('/magic-link?persistent=' + type, {
				method: 'POST',
				headers: {
					accept: 'application/json'
				}
			});
		} catch (e) {
			console.log(e);
		} finally {
			await invalidate('/magic-link');
			creating = false;
			$notify = {
				active: true,
				message: 'Magic link created',
				colour: 'success',
				icon: Link
			};
		}
	};

	const deleteMagicLink = async (key: string) => {
		try {
			deleting = true;
			await fetch('magic-link/' + key, {
				method: 'DELETE'
			});

			await invalidate('/magic-link');

			$notify = {
				active: true,
				message: 'Magic link deleted',
				colour: 'negative',
				icon: Trash
			};
		} catch (e) {
			console.log(e);
		} finally {
			deleting = false;
		}
	};
</script>

<section class="prose">
	<h1>Magic Links</h1>
	<p>
		Click the buttons below to generate a 'magic link', which will authenticate users without the
		need for a password. They will not need to log in next time they visit the site.
	</p>
	<p>
		Add <code>?redirect=/location/to/redirect/to</code> to create a link which will redirect to a specific
		page.
	</p>
	<p>Note that you can't create a magic link to log a user in as an admin.</p>
	<div class="flex my-4 gap-4">
		<Button clickHandler={() => createMagicLink('persist')} colour="neutral" disabled={creating}
			>New Permanent Magic Link</Button
		><Button clickHandler={() => createMagicLink('temp')} colour="primary" disabled={creating}
			>New Single Use Magic Link</Button
		>
	</div>

	<div class="py-1 bg-primary-100 rounded-lg border border-primary-100 ">
		<table class="not-prose table w-full bg-white" class:deleting>
			<thead><tr><th>Magic Link</th><th>Type</th><th /></tr></thead>
			{#each magicLinks as link}<tr transition:fly
					><td>{import.meta.env.VITE_BASE_URL}/magic-link/{link.link}</td><td class="capitalize"
						>{link.type === 'persist' ? 'Persistent' : 'Temporary'}</td
					><td
						on:click={() => deleteMagicLink(link.link + '-' + link.type)}
						class="cursor-pointer"
						class:deleting><XCircle /></td
					></tr
				>{:else}<tr><td colspan="2">No magic links!</td></tr>{/each}
		</table>
	</div>
</section>

<style lang="scss">
	input {
		@apply rounded;
	}
	.deleting {
		@apply cursor-wait;
	}
	code {
		@apply bg-neutral-700 text-neutral-100 p-1 rounded;
		&::before {
			content: '';
		}
		&::after {
			content: '';
		}
	}

	.table {
		@apply border-collapse table-auto w-full text-sm  my-0;
		tr {
			@apply border-b border-primary-100;
			&:nth-child(even) {
				@apply bg-neutral-50;
			}
		}
		td,
		th {
			@apply p-2;
		}
		thead {
			@apply p-2 bg-primary-100;
		}
	}
</style>
