<script lang="ts">
  import type { Object as S3Object } from 'aws-sdk/clients/s3';
  import type { PageData } from './$types';

  import { page } from '$app/stores';
  import Lightbox from '$lib/components/Lightbox.svelte';
  import Gallery from '$lib/components/Gallery.svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import { parse, format } from 'date-fns';

  export let data: PageData;
  const { auth } = $page.data;

  const getMonthTitle = (month: string) => {
    try {
      const monthDate = parse(month, 'yyyy/MM', new Date());
      const title = format(monthDate, 'MMMM yyyy');
      return title;
    } catch (e) {
      return 'Error';
    }
  };

  interface Image {
    fullKey: string;
  }
  interface ImagesMap {
    [month: string]: Image[];
  }
  let images: ImagesMap = {};

  $: {
    const { list } = data;
    list
      .sort((a, b) => {
        if (!a.Key || !b.Key) return 0;
        return a.Key.localeCompare(b.Key) || 0;
      })
      .forEach((el) => {
        if (!el || !el.Key) return;
        let month = el.Key.substring(0, 7);
        if (images[month]) {
          if (!images[month].find((img) => img.fullKey === el.Key)) {
            images[month] = [
              ...images[month],
              {
                fullKey: el.Key || ''
              }
            ];
          }
        } else {
          images[month] = [
            {
              fullKey: el.Key
            }
          ];
        }
      });
  }
</script>

{#if !Object.keys(images).length}
  <section class="prose prose-xl">
    <h3>No photos uploaded!</h3>
    {#if auth === 'admin'}
      <p>To get started, click the 'Upload Photos' button on the top right.</p>
    {:else}
      <p>The site owner has not yet uploaded any photos.</p>
    {/if}
  </section>
{:else}
  <Timeline {images} />
  {#each Object.keys(images).sort().reverse() as month}
    <Gallery images={images[month]} title={getMonthTitle(month)} />
  {/each}
{/if}

<Lightbox />
