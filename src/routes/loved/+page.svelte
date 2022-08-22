<script lang="ts">
  import { onMount } from 'svelte';
  import Gallery from '$lib/components/Gallery.svelte';
  import { EmojiSad } from 'svelte-heros';
  import { loved } from '$lib/stores/loved';
  type Image = {
    fullKey: string;
  };
  let images: Image[] = $loved;
  $: {
    images = $loved;
  }
</script>

<Gallery {images} title="Loved" />

{#if !images.length}
  <div class="prose">
    <h1>Oh No</h1>
    <p>You haven't loved anything yet.</p>
    <EmojiSad />
  </div>
{/if}
