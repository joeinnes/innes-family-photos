<script lang="ts">
  import Image from '$lib/components/Image.svelte';

  import Heading from '$lib/components/Heading.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  import { selected, gallery } from '$lib/stores/selected';
  import { loved } from '$lib/stores/loved';
  import { MenuAlt2, ViewGrid } from 'svelte-heros';

  type Image = {
    fullKey: string;
  };
  export let images: Image[];

  export let title = '';

  let grid = false;
  let root: HTMLElement;
  let loaded = false;

  let observer: IntersectionObserver;

  onMount(() => {
    if (!root) {
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loaded = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0, root: null, rootMargin: '0px' }
    );
    observer.observe(root);
  });

  onDestroy(() => {
    observer?.disconnect();
  });

  const handleClick = (fk: string) => {
    $selected = fk;
    $gallery = images;
  };

  let isLoved = (img: Image) => false;
  let theseImages;
  $: {
    theseImages = images.sort((a, b) => {
      try {
        return b?.fullKey?.localeCompare(a.fullKey) || 0;
      } catch (e) {
        console.error(e);
        return 0;
      }
    });
    isLoved = (img: Image) => {
      return $loved.find((el: Image) => el.fullKey === img.fullKey) ? true : false;
    };
  }
</script>

{#if title !== 'Invalid Date'}
  <section bind:this={root} class="gallery" in:fade id={encodeURIComponent(title)}>
    <div class="gallery-header">
      <Heading level={3}>{title}</Heading>
      <div class="ml-2 flex gap-2">
        <div class="button" on:click={() => (grid = true)}>
          <ViewGrid />
        </div>
        <div class="button" on:click={() => (grid = false)}>
          <MenuAlt2 />
        </div>
      </div>
    </div>
    {#key grid}
      <div class="gallery not-prose" class:gallery-grid={grid}>
        {#if loaded}
          {#each images as image}
            <Image
              {image}
              clickHandler={(fk) => {
                $selected = fk;
                $gallery = images;
              }}
            />
          {/each}
        {/if}
      </div>
    {/key}
  </section>
{/if}

<style lang="scss">
  .gallery {
    @apply my-4;

    .gallery-header {
      @apply flex gap-2;

      .button {
        @apply hover:bg-primary-100 transition-colors cursor-pointer flex flex-col items-center justify-center rounded-full w-8 h-8;
      }
    }

    .gallery {
      @apply my-4 gap-4 flex flex-wrap;
      &::after {
        content: '';
        flex-grow: 999999999;
      }
      div {
        @apply w-full md:w-auto flex-grow relative rounded-2xl overflow-hidden;
      }
    }

    .gallery.gallery-grid {
      @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4;
    }
  }
</style>
