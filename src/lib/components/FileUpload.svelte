<script lang="ts">
	import { notify } from '$lib/stores/notify';
	import { Camera, CheckCircle } from 'svelte-heros';
	import Button from '$lib/components/Button.svelte';
	import { invalidate } from '$app/navigation';
	import { ExifParserFactory } from 'ts-exif-parser';
	import { fly } from 'svelte/transition';

	export let open = false;
	let dialog: HTMLDialogElement;
	let form: HTMLFormElement;
	type ReadFile = {
		src: string;
		meta: boolean;
	};
	let warniOS = false;
	let filesData: ReadFile[] = [];
	let submitting = false;
	const reset = () => {
		form.reset();
		filesData = [];
		dialog.close();
	};
	const uploadFile = async (
		e: Event & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) => {
		try {
			submitting = true;
			dialog.close();
			const target = e.target as HTMLFormElement & {
				files: HTMLInputElement;
			};
			const files = target.files.files;
			if (!files) {
				return;
			}

			const formData = new FormData();
			for (let file of files) {
				formData.append('files', file);
			}

			const res = await fetch('/', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) {
				throw new Error('Files not uploaded.');
			}

			$notify = {
				active: true,
				icon: CheckCircle,
				colour: 'success',
				heading: 'Files uploaded!',
				callback: () => {
					form.reset();
					invalidate('/');
				}
			};
		} catch (e) {
			$notify = {
				active: true,
				icon: CheckCircle,
				colour: 'negative',
				heading: 'Upload error',
				message: 'There was an error during the upload.'
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
			let meta = true;
			const reader = new FileReader();

			reader.addEventListener('load', function () {
				let res = {
					src: '',
					meta
				};
				if (typeof reader.result !== 'string') {
					res.src = reader.result?.toString() || '';
				} else {
					res.src = reader.result;
				}
				let reader2 = new FileReader();
				reader2.addEventListener('loadend', () => {
					if (!(reader2.result instanceof ArrayBuffer)) throw new Error('Expected ArrayBuffer');
					const parser = ExifParserFactory.create(reader2.result);
					const parsed = parser.parse();
					if (!parsed?.tags?.DateTimeOriginal) {
						res.meta = false;
						warniOS = true;
					}
					filesData = [...filesData, res];
				});
				reader2.readAsArrayBuffer(files[i]);
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

<dialog bind:this={dialog} class="w-full md:w-2/3 lg:w-1/2 bg-white rounded shadow">
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
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-lg not-prose mt-4">
				{#each filesData as fileData, i}
					<div class="relative">
						<img
							src={fileData.src}
							alt="Preview {i}"
							class="w-full h-auto aspect-square object-cover rounded"
						/>
					</div>
				{/each}
				<div
					class="bg-primary-100 text-primary-300 aspect-square w-full text-bold flex flex-col justify-center items-center text-6xl h-auto rounded"
				>
					&plus;
				</div>
			</div>
		</label>
		{#if warniOS}
			<div transition:fly>
				<small>
					Your device is hiding metadata. This is a good thing for your privacy, but means we'll be
					guessing at the date one or more of the photos above was taken.<a
						href="/metadata-stripping"
						target="_blank">More here</a
					>.
				</small>
			</div>
		{/if}
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
