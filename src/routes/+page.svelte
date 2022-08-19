<script lang="ts">
  import type { Object as S3Object } from 'aws-sdk/clients/s3';
  import type { PageData } from './$types';

  import { page } from '$app/stores';
  import Lightbox from '$lib/components/Lightbox.svelte';
  import Gallery from '$lib/components/Gallery.svelte';
  import Timeline from '$lib/components/Timeline.svelte';

  export let data: PageData;
  const { auth } = $page.data;

  const getMonthTitle = (month: string) => {
    try {
      return new Date(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Error';
    }
  };

  interface Image {
    key: string;
    prefix: string;
    fullKey: string;
  }
  interface ImagesMap {
    [month: string]: Image[];
  }
  let images: ImagesMap = {};

  $: {
    const { list } = data;
    list
      .sort((a: S3Object, b: S3Object) => {
        if (!a.Key || !b.Key) return;
        return a.Key.localeCompare(b.Key);
      })
      .forEach((el: S3Object) => {
        if (!el || !el.Key) return;
        let month = el.Key.substring(0, 7);
        let fileName = el.Key.substring(8);
        if (images[month]) {
          if (!images[month].find((el) => el.key === fileName)) {
            images[month] = [
              ...images[month],
              {
                key: fileName,
                prefix: month,
                fullKey: el.Key || ''
              }
            ];
          }
        } else {
          images[month] = [
            {
              key: fileName,
              prefix: month,
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
