<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { goto, invalidate } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { fade } from 'svelte/transition';
  import { selected, gallery } from '$lib/stores/selected';
  import { Trash, Link, CloudDownload, CheckCircle, ChevronLeft, ChevronRight } from 'svelte-heros';
  import Messenger from './icons/Messenger.svelte';
  import WhatsApp from './icons/WhatsApp.svelte';
  import { notify } from '$lib/stores/notify';

  export let canClose = true;

  const { auth } = $page.data;

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
      dialog.close();
      await fetch(`/file/${$selected}`, {
        method: 'DELETE'
      });
      $notify = {
        active: true,
        message: 'Deleted file',
        icon: Trash,
        colour: 'negative'
      };
      invalidate('/');
    } catch (e) {
      console.error(e);
      $notify = {
        active: true,
        message: 'Could not delete file!',
        icon: Trash,
        colour: 'delete'
      };
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
  let next: number;
  let last: number;
  $: {
    next = $gallery.findIndex((g) => g.fullKey === $selected) + 1;
    last = $gallery.findIndex((g) => g.fullKey === $selected) - 1;
    if (next === $gallery.length) {
      next = -1;
    }
    if (last < 0) {
      last = -1;
    }
  }
</script>

{#if $selected}
  <div class="z-20 select-none">
    <div
      class="lightbox-container transition-colors duration-200"
      transition:fade={{ duration: 200 }}
      style="background-color: {colour}f0;"
      on:scroll|preventDefault
      on:wheel|preventDefault
    >
      <div class="lightbox-photo relative" on:click|self={close}>
        <div />
        <figure
          class="zoom shadow-2xl mb-4"
          on:mousemove={zoom}
          style="background-image: url({'/file/' + $selected}); background-color: #000;"
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
          <div
            class="relative md:absolute md:top-1/2 md:left-2 text-xl md:text-6xl z-30 border-4 rounded-full transition-colors {last ===
            -1
              ? 'cursor-not-allowed bg-neutral-300 text-neutral-400 border-neutral-400 hover:text-red-300 hover:border-red-300'
              : 'text-white cursor-pointer hover:bg-white hover:border-neutral-500 hover:text-neutral-500 border-white'}"
            on:click={() => {
              if (last > -1) {
                $selected = $gallery[last].fullKey;
              }
            }}
          >
            <ChevronLeft class="w-8 h-8 md:w-16 md:h-16" />
          </div>
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
          {#if auth === 'admin'}
            <Button colour="neutral" clickHandler={() => dialog.showModal()}
              ><Trash slot="icon" />Delete</Button
            >
          {/if}
          <div
            class="relative md:absolute md:top-1/2 md:right-2 text-xl md:text-6xl z-30 border-4 rounded-full  transition-colors {next ===
            -1
              ? 'cursor-not-allowed bg-neutral-300 text-neutral-400 border-neutral-400 hover:text-red-300 hover:border-red-300'
              : 'text-white cursor-pointer hover:bg-white hover:border-neutral-500 hover:text-neutral-500 border-white'}"
            on:click={() => {
              if (next !== -1) {
                $selected = $gallery[next].fullKey;
              }
            }}
          >
            <ChevronRight class="w-8 h-8 md:w-16 md:h-16" />
          </div>
        </div>

        <dialog
          class="backdrop:bg-gray-50 backdrop:bg-opacity-80 w-96 bg-white z-20 rounded border-2 shadow"
          style="border-color: {colour}"
          bind:this={dialog}
        >
          <p>Are you sure? You can't undo this.</p>
          <div class="flex gap-2 justify-end pt-4">
            <Button colour="neutral" clickHandler={() => dialog.close()}>Cancel</Button>

            <Button colour="negative" clickHandler={deleteFile}>Yes, delete</Button>
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
      @apply w-full h-full flex flex-col justify-between items-center text-white;
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
