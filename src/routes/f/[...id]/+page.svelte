<script lang="ts">
  import type { PageData } from './$types';

  import { goto } from '$app/navigation';
  import { selected } from '$lib/stores/selected';
  import Lightbox from '$lib/components/Lightbox.svelte';
  export let data: PageData;
  $: ({ id } = data);
  if (!id) {
    goto('/');
  } else {
    $selected = id;
  }
</script>

<Lightbox canClose={false} />
