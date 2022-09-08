<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { selected, gallery } from '$lib/stores/selected';
  import { loved } from '$lib/stores/loved';
  import { Heart, Photograph, CheckCircle } from 'svelte-heros';
  import { parse, format } from 'date-fns';
  import { collection } from '$lib/stores/collection';

  type Image = {
    fullKey: string;
  };
  export let image: Image;
  export let clickHandler = (id: string) => {
    return;
  };

  const imgUrl = `/file/${image.fullKey}?size=500`;

  let grid = false;
  let root: HTMLElement;
  let loaded = false;
  let isSelected = false;
  let time = '';

  try {
    time = format(
      parse(image.fullKey.split('Z')[0], 'yyyy/MM/dd/HH:mm:ss', new Date()),
      'dd MMM yyyy, HH:mm'
    );
  } catch (e) {
    console.log(e);
  }

  const love = (image: Image) => {
    const index = $loved.findIndex((el: Image) => {
      return el.fullKey === image.fullKey;
    });
    let newLoved = [...$loved];
    if (index > -1) {
      newLoved.splice(index, 1);
    } else {
      newLoved.push(image);
    }
    $loved = newLoved;
  };

  const select = (image: Image) => {
    const index = $collection.findIndex((el: Image) => {
      return el.fullKey === image.fullKey;
    });
    let newCollection = [...$collection];
    if (index > -1) {
      newCollection.splice(index, 1);
    } else {
      newCollection.push(image);
    }
    $collection = newCollection;
  };

  const preload = (src: string) => {
    return new Promise(function (resolve, reject) {
      let img = new Image();
      img.onload = resolve;
      img.src = src;
      img.onerror = reject;
    });
  };
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

  let isLoved = false;
  $: {
    isLoved = $loved.find((el: Image) => el.fullKey === image.fullKey) ? true : false;
    isSelected = $collection.find((el: Image) => el.fullKey === image.fullKey) ? true : false;
  }
</script>

{#await preload(imgUrl)}
  <div class="skeleton loading" class:aspect-square={grid}>
    <Photograph size="48" />
  </div>
{:then _}
  <div class="image-container group" on:click={() => clickHandler(image.fullKey)}>
    <img src={imgUrl} alt={imgUrl} in:fly|local={{ y: 50, duration: 200 }} loading="lazy" />
    <div class="date-overlay translate-y-full group-hover:translate-y-0">
      {time}
    </div>

    <div class="controls">
      {#key isLoved}
        <div
          class="overlay text-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform"
          on:click|stopPropagation={() => love(image)}
        >
          <div in:fade>
            <Heart
              class=" transform duration-200 transition-transform hover:scale-110"
              variation={isLoved ? 'solid' : 'outline'}
            />
          </div>
        </div>
      {/key}

      {#if $page.data.auth === 'admin'}
        {#key isSelected}
          <div
            class="overlay text-primary-500 transform transition-transform {isSelected
              ? ''
              : 'translate-x-full group-hover:translate-x-0'}"
            on:click|stopPropagation={() => select(image)}
          >
            <div in:fade>
              <CheckCircle
                class=" transform duration-200 transition-transform hover:scale-110"
                variation={isSelected ? 'solid' : 'outline'}
              />
            </div>
          </div>
        {/key}
      {/if}
    </div>
  </div>
{:catch}
  <div class="skeleton error" class:aspect-square={grid}>
    <Photograph size="48" />
  </div>
{/await}

<style lang="scss">
  .skeleton {
    @apply flex justify-center items-center w-full h-64 aspect-video animate-pulse rounded-2xl text-gray-200;
    &.error {
      @apply bg-red-300 animate-none cursor-not-allowed;
    }
    &.loading {
      @apply bg-gray-300;
    }
  }
  .image-container {
    @apply w-full md:w-auto flex-grow relative rounded-2xl overflow-hidden;
    img {
      @apply cursor-pointer h-64 min-w-full max-w-full flex-1 flex-grow transform bg-neutral-400 object-cover transition-transform;
    }
    .controls {
      @apply absolute top-2 right-0 flex flex-col gap-2 justify-center items-center;
      .overlay {
        @apply bg-white border-2 border-current border-r-0 p-1 px-2 rounded-l-full;
      }
    }
    .date-overlay {
      @apply transform absolute bottom-0 text-neutral-50 text-sm font-thin bg-gradient-to-t from-neutral-900 to-transparent pl-2 pt-4 pb-1 select-none cursor-pointer transition-transform duration-200 w-full;
    }
  }
</style>
