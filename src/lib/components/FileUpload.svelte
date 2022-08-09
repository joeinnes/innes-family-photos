<script lang="ts">
	import { notify } from '$lib/stores/notify';
	import { Camera, CheckCircle } from 'svelte-heros';
	import Button from '$lib/components/Button.svelte';

	export let open = false;
	let dialog: HTMLDialogElement;
	let form: HTMLFormElement;
	let dataUrls: string[] = [];
	let submitting = false;
	const reset = () => {
		form.reset();
		dataUrls = [];
		dialog.close();
	};
	const uploadFile = async (
		e: Event & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) => {
		try {
			submitting = true;

			const target = e.target as HTMLFormElement & {
				files: HTMLInputElement;
			};
			const files = target.files.files;
			if (!files) {
				return;
			}

			const formData = new FormData();
			for (let file of files) {
				const { lastModified } = file;
				const LMD = new Date(lastModified);
				const month = (LMD.getMonth() + 1).toString().padStart(2, '0');
				const year = LMD.getFullYear();
				const fileName = `${year}-${month}/${file.name}`;
				formData.append('files', file, fileName);
			}
			await fetch('/', {
				method: 'POST',
				body: formData
			});

			$notify = {
				active: true,
				icon: CheckCircle,
				colour: 'success',
				heading: 'Files uploaded!',
				callback: () => {
					form.reset();
					window.location.reload();
				}
			};
		} catch (e) {
			$notify = {
				active: true,
				icon: CheckCircle,
				colour: 'success',
				heading: 'Files not uploaded!',
				message: 'There was an error uploading the files.'
			};
			console.error(e);
		} finally {
			submitting = false;
		}
	};

	interface FileChangeEvent extends Event {
		currentTarget: EventTarget & HTMLInputElement;
	}

	const handleFileChange = async (e: FileChangeEvent) => {
		const files = e.currentTarget.files;
		if (!files || !files.length) return;
		for (let i = 0; i < files.length; i++) {
			const reader = new FileReader();
			reader.addEventListener('load', function () {
				let res = '';
				if (typeof reader.result !== 'string') {
					res = reader.result?.toString() || '';
				} else {
					res = reader.result;
				}
				dataUrls = [...dataUrls, res];
			});
			reader.readAsDataURL(files[i]);
		}
	};
	$: {
		if (open && dialog) {
			dialog.showModal();
		} else if (dialog) {
			dialog.close();
		}
	}
</script>

<Button colour="light" clickHandler={() => dialog.showModal()} forceText={true}
	><Camera slot="icon" /> Upload Photos</Button
>

<dialog bind:this={dialog} class="w-96">
	<form
		on:submit|preventDefault={(e) => uploadFile(e)}
		class="flex flex-col gap-2"
		bind:this={form}
	>
		<label for="files" class="cursor-pointer"
			><span class="font-bold text-2xl">Upload Files</span>

			<input
				type="file"
				id="files"
				name="files"
				multiple
				accept="image/*, video/*, audio/*"
				on:change={handleFileChange}
				class="hidden"
				required
			/>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-2 not-prose mt-4">
				{#each dataUrls as src, i}
					<img {src} alt="Preview {i}" class="w-full h-auto aspect-square object-cover" />
				{/each}
				<div
					class="bg-primary-100 text-primary-300 aspect-square w-full text-bold flex flex-col justify-center items-center text-6xl h-auto"
				>
					&plus;
				</div>
			</div>
		</label>
		<div class="flex gap-2 w-full justify-end">
			<Button type="reset" bind:disabled={submitting} colour="neutral" clickHandler={reset}
				>Cancel</Button
			>
			<Button type="submit" colour="primary" bind:disabled={submitting}
				><div class="flex gap-2">
					{#if submitting}<div class="spinner w-6 h-6" />{/if}Upload
				</div></Button
			>
		</div>
	</form>
</dialog>

<style lang="scss">
	.spinner {
		border: 5px solid rgba(255, 255, 255, 0.5);
		border-bottom-color: #fff;
		border-radius: 100%;
		@apply animate-spin;
	}
</style>
