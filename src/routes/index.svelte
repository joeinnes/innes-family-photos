<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import Gallery from '$lib/components/Gallery.svelte';

	import { session } from '$app/stores';
	const { auth } = $session;
	export let list = [
		{
			Key: ''
		}
	];

	const getMonthTitle = (month: string) => {
		try {
			return new Date(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
		} catch (e) {
			return 'Error';
		}
	};

	interface Image {
		key: string;
		prefix: string;
		fullKey: string;
	}
	interface ImagesMap {
		[month: string]: Image[];
	}
	let images: ImagesMap = {};
	$: {
		list.forEach((el) => {
			let month = el.Key.substring(0, 7);
			let fileName = el.Key.substring(8);
			if (images[month]) {
				if (!images[month].find((el) => el.key === fileName)) {
					images[month] = [
						...images[month],
						{
							key: fileName,
							prefix: month,
							fullKey: el.Key
						}
					];
				}
			} else {
				images[month] = [
					{
						key: fileName,
						prefix: month,
						fullKey: el.Key
					}
				];
			}
		});
	}
</script>

{#if !Object.keys(images).length}
	<section class="prose prose-xl">
		<h3>No photos uploaded!</h3>
		{#if auth === 'admin'}
			<p>To get started, click the 'Upload Photos' button on the top right.</p>
		{:else}
			<p>The site owner has not yet uploaded any photos.</p>
		{/if}
	</section>
{:else}
	{#each Object.keys(images).sort().reverse() as month}
		<Gallery images={images[month]} title={getMonthTitle(month)} />
	{/each}
{/if}

<Lightbox />
