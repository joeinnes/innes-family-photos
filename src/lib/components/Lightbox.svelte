<script lang="ts">
	import { browser } from '$app/env';
	import { invalidate, goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { fade } from 'svelte/transition';
	import { selected } from '$lib/stores/selected';
	import { Trash, Link, CloudDownload, CheckCircle } from 'svelte-heros';
	import Messenger from './icons/Messenger.svelte';
	import WhatsApp from './icons/WhatsApp.svelte';
	import { notify } from '$lib/stores/notify';

	export let admin = false;
	export let canClose = true;

	let copied = false;
	let touched = false;

	let el: HTMLImageElement;
	let dialog: HTMLDialogElement;
	let colour = '#000000';

	const zoom = (e: (MouseEvent | TouchEvent) & { currentTarget: HTMLElement }) => {
		const zoomer = e.currentTarget;
		let offsetX = 0;
		let offsetY = 0;
		if (e instanceof TouchEvent) {
			offsetX = e.touches[0].pageX;
			offsetY = e.touches[0].pageY;
		} else {
			offsetX = e.offsetX;
			offsetY = e.offsetY;
		}
		let x = (offsetX / zoomer.offsetWidth) * 100;
		let y = (offsetY / zoomer.offsetHeight) * 100;
		zoomer.style.backgroundPosition = x + '% ' + y + '%';
	};

	const get_average_rgb = (img: HTMLImageElement) => {
		if (!img) return;
		var context = document.createElement('canvas').getContext('2d');
		if (!context) return;
		context.imageSmoothingEnabled = true;
		context.drawImage(img, 0, 0, 1, 1);
		const data = context.getImageData(0, 0, 1, 1).data.slice(0, 3);
		if (data && data.length > 2) {
			colour = '#' + ((1 << 24) + (data[0] << 16) + (data[1] << 8) + data[2]).toString(16).slice(1);
		} else {
			colour = '#000000';
		}
	};

	const deleteFile = async () => {
		try {
			await fetch(`/file/${$selected}`, {
				method: 'DELETE'
			});
			// TODO: not reloading, no obvious action being taken, but file is deleted silently
			invalidate('/');
			goto('/');
		} catch (e) {
			console.error(e);
		}
	};

	const copyLink = () => {
		setTimeout(
			async () =>
				await navigator.clipboard.writeText(`${import.meta.env.VITE_BASE_URL}/f/${$selected}`)
		);
		$notify = {
			active: true,
			icon: CheckCircle,
			colour: 'success',
			heading: 'Link copied'
		};
	};
	const close = () => {
		if (canClose) {
			$selected = '';
		}
	};
	$: {
		if (browser && el && $selected) {
			get_average_rgb(el);
		}
	}
</script>

{#if $selected}
	<div class="z-20">
		<div
			class="lightbox-container"
			transition:fade={{ duration: 200 }}
			style="background-color: {colour}f0; "
			on:scroll|preventDefault
			on:mousewheel|preventDefault
		>
			<div class="lightbox-photo relative" on:click|self={close}>
				<figure
					class="zoom shadow-2xl mb-4"
					on:mousemove={zoom}
					style="background-image: url({'/file/' + $selected})"
					draggable="false"
				>
					<img
						src={'/file/' + $selected}
						alt={$selected}
						bind:this={el}
						on:load={() => get_average_rgb(el)}
						draggable="false"
					/>
				</figure>
				<div class="flex gap-1 md:gap-2">
					<Button colour="neutral" clickHandler={() => goto('/file/' + $selected)}
						><CloudDownload slot="icon" />Download</Button
					>

					<Button colour="neutral" clickHandler={copyLink}>
						<Link slot="icon" />Copy Link</Button
					>
					<a
						href="whatsapp://send?text={`${import.meta.env.VITE_BASE_URL}/f/${$selected}`}"
						class="font-normal no-underline"
					>
						<Button colour="neutral">
							<WhatsApp slot="icon" />
							Share on WhatsApp
						</Button>
					</a>
					<a
						href="fb-messenger://share?link={`${import.meta.env.VITE_BASE_URL}/f/${$selected}`}"
						class="font-normal no-underline"
						><Button colour="neutral"><Messenger slot="icon" />Share on Messenger</Button></a
					>
					{#if admin}
						<Button colour="neutral" clickHandler={() => dialog.showModal()}
							><Trash slot="icon" />Delete</Button
						>
					{/if}
				</div>
				<dialog
					class="backdrop:bg-gray-50 backdrop:bg-opacity-80 w-96 bg-white z-20 rounded border-2 shadow"
					style="border-color: {colour}"
					bind:this={dialog}
				>
					<p>Are you sure? You can't undo this.</p>
					<div class="flex gap-2 justify-end pt-4">
						<Button colour="neutral" clickHandler={(e) => dialog.close()}>Cancel</Button>

						<button class="bg-red-400 px-4 p-2 border-red-800 border rounded" on:click={deleteFile}
							>Yes, delete</button
						>
					</div>
				</dialog>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.lightbox {
		&-container {
			@apply fixed top-0 bottom-0 left-0 right-0 bg-opacity-80 p-4 md:p-6 lg:p-12 xl:p-24 overflow-hidden;
			transform: translate3d(0, 0, 0);
		}
		&-photo {
			@apply w-full h-full flex flex-col justify-center items-center text-white;
		}
	}
	@media (hover: hover) {
		figure.zoom {
			& img:hover {
				@apply opacity-0;
			}
			img {
				@apply transition-opacity block object-contain w-full h-full;
				-webkit-touch-callout: none;
			}
			background-position: 50% 50%;
			position: relative;
			object-fit: contain;
			overflow: hidden;
			cursor: zoom-in;
			&:hover {
				background-size: 200%;
			}
			&:active {
				background-size: 400%;
			}
		}
	}
</style>
