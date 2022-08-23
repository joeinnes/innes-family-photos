<script lang="ts">
  import { collection } from '$lib/stores/collection';
  import { Collection } from 'svelte-heros';
  import { page } from '$app/stores';
</script>

{#if $page.routeId !== 'collection'}
  <a
    href="/collection"
    class="fixed z-50 flex cursor-pointer items-center gap-2 top-1/2 right-0 bg-neutral-50 border p-2 border-r-0 rounded-l-full transform transition-all pr-2 hover:bg-neutral-200 text-sm {$collection.length
      ? 'translate-x-0'
      : 'translate-x-full'}"
  >
    <Collection /> Add {$collection.length} photo{$collection.length > 1 ? 's' : ''} to a collection
  </a>
{/if}
