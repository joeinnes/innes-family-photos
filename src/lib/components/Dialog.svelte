<script lang="ts">
  import Heading from '$lib/components/Heading.svelte';
  export let open = false;
  let dialog: HTMLDialogElement;
  $: {
    if (open && dialog) {
      dialog.showModal();
    } else {
      dialog?.close();
    }
  }
</script>

<dialog
  class="backdrop:bg-gray-50 backdrop:bg-opacity-80 w-96 bg-white z-20 rounded border-2 shadow"
  bind:this={dialog}
>
  <div class="mb-4">
    <Heading level={4}><slot name="title" /></Heading>
  </div>
  <slot />
</dialog>

<style lang="scss">
  dialog::backdrop {
    @apply backdrop:bg-gray-50 backdrop:bg-opacity-80;
  }
  dialog :global(input) {
    @apply w-full p-2 border-neutral-300 border rounded block;
  }
  dialog :global(select) {
    @apply w-full p-2 border-neutral-300 border rounded block;
  }
</style>
