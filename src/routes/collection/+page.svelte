<script lang="ts">
  import type { PageData } from './$types';
  import { collection } from '$lib/stores/collection';
  import { notify } from '$lib/stores/notify';
  import Gallery from '$lib/components/Gallery.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Button from '$lib/components/Button.svelte';
  import Dialog from '$lib/components/Dialog.svelte';
  import { onMount } from 'svelte';
  import { CheckCircle, Collection, Trash } from 'svelte-heros';
  import { invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  export let data: PageData;
  let deleteIntent = false;
  let updateIntent = false;
  let createIntent = false;
  let addIntent = false;
  let selectedCollection: string;
  let working = false;
  let newCollectionName: string;
  let existingCollection: string;
  let collectionLengthOnMount = 0;

  const createCollection = async (name: string) => {
    working = true;
    const uriSafeName = encodeURIComponent(name);
    const content = $collection.map((el) => el.fullKey);
    await fetch('/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: uriSafeName,
        content
      })
    });
    $collection = [];
    collectionLengthOnMount = 0;
    invalidate('/collection');
    $notify = {
      active: true,
      colour: 'success',
      message: 'Created collection',
      icon: Collection
    };
    working = false;
  };

  const updateCollection = async (name: string) => {
    working = true;
    const collectionToUpdate = collections.find((el) => el.name === name);
    console.log(name, collectionToUpdate, collections);
    const uriSafeName = encodeURIComponent(name);
    const newImages = collectionToUpdate.images.filter((el) => !$collection.includes(el));
    const content = newImages.map((el) => el.fullKey);
    await fetch('/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: uriSafeName,
        content
      })
    });
    $notify = {
      active: true,
      colour: 'success',
      message: 'Collection updated',
      icon: CheckCircle
    };
    updateIntent = false;
    $collection = [];
    invalidate('/collection');
    working = false;
    collectionLengthOnMount = 0;
  };

  const addToCollection = async (name: string) => {
    working = true;
    const collectionToUpdate = collections.find((el) => el.name === name);
    const uriSafeName = encodeURIComponent(name);
    const newImages = $collection.filter((el) => !collectionToUpdate.images.includes(el));

    const content = Array.from(
      new Set([...collectionToUpdate.images, ...newImages].map((el) => el.fullKey))
    );

    await fetch('/collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: uriSafeName,
        content
      })
    });
    $notify = {
      active: true,
      colour: 'success',
      message: 'Collection updated',
      icon: CheckCircle
    };
    collectionLengthOnMount = 0;
    addIntent = false;
    $collection = [];
    existingCollection = '';
    invalidate();
    working = false;
  };
  const deleteCollection = async (name: string) => {
    working = true;
    const uriSafeName = encodeURIComponent(name);
    await fetch(`/collection/${uriSafeName}`, {
      method: 'DELETE'
    });
    $notify = {
      active: true,
      colour: 'negative',
      message: 'Deleted collection',
      icon: Trash
    };
    $collection = [];
    selectedCollection = '';
    deleteIntent = false;
    invalidate();
    working = false;
    collectionLengthOnMount = 0;
  };

  onMount(() => {
    collectionLengthOnMount = $collection.length;
  });

  $: ({ collections } = data);
</script>

{#if collectionLengthOnMount > 0}
  <div class="flex gap-2">
    <Button
      colour="primary"
      clickHandler={() => {
        createIntent = true;
      }}>Create New Collection</Button
    >
    {#if collections.length}
      <Button
        colour="light"
        clickHandler={() => {
          addIntent = true;
        }}>Add To Existing Collection</Button
      >
    {/if}
  </div>
  <Gallery images={$collection} title="Selected Photos" />
  <Dialog open={createIntent}>
    <svelte:fragment slot="title">Create a new collection?</svelte:fragment>
    <label
      >New collection name
      <input type="text" bind:value={newCollectionName} />
    </label>
    <div class="flex gap-2 justify-end pt-4">
      <Button colour="neutral" disabled={working} clickHandler={() => (createIntent = false)}
        >Cancel</Button
      >

      <Button colour="primary" {working} clickHandler={() => createCollection(newCollectionName)}
        >Create collection</Button
      >
    </div>
  </Dialog>
  <Dialog open={addIntent}>
    <svelte:fragment slot="title">Add to an existing collection?</svelte:fragment>
    <label
      >Choose collection to add to
      <select bind:value={existingCollection}>
        {#each collections as thisCollection}
          <option value={thisCollection.name}>{thisCollection.name}</option>
        {/each}
      </select>
    </label>
    <div class="flex gap-2 justify-end pt-4">
      <Button colour="neutral" disabled={working} clickHandler={() => (createIntent = false)}
        >Cancel</Button
      >

      <Button colour="primary" {working} clickHandler={() => addToCollection(existingCollection)}
        >Add to collection</Button
      >
    </div>
  </Dialog>
{:else}
  <section>
    <Heading level={2}>Collections</Heading>
    {#if !collections.length}No collections yet!{/if}
    {#each collections as thisCollection}
      <Gallery images={thisCollection.images} title={decodeURIComponent(thisCollection.name)} />
      {#if $page.data.auth === 'admin'}
        <div class="flex gap-2">
          <Button
            colour="neutral"
            clickHandler={() => {
              selectedCollection = thisCollection.name;
              updateIntent = true;
            }}>Remove photos from collection</Button
          ><Button
            colour="negative"
            {working}
            clickHandler={() => {
              selectedCollection = thisCollection.name;
              deleteIntent = true;
            }}>Delete collection</Button
          >
        </div>
      {/if}
    {/each}
  </section>

  <Dialog open={deleteIntent}>
    <svelte:fragment slot="title">Delete {selectedCollection}?</svelte:fragment>
    <p>Are you sure? You can't undo this.</p>
    <div class="flex gap-2 justify-end pt-4">
      <Button colour="neutral" disabled={working} clickHandler={() => (deleteIntent = false)}
        >Cancel</Button
      >

      <Button colour="negative" {working} clickHandler={() => deleteCollection(selectedCollection)}
        >Yes, delete</Button
      >
    </div>
  </Dialog>

  <Dialog open={updateIntent}>
    <svelte:fragment slot="title"
      >Remove {$collection.length} photo{$collection.length > 1 ? 's' : ''} from {selectedCollection}?</svelte:fragment
    >
    <p>Removing the photos from the collection will not delete them from the timeline.</p>
    <div class="flex gap-2 justify-end pt-4">
      <Button colour="neutral" disabled={working} clickHandler={() => (updateIntent = false)}
        >Cancel</Button
      >

      <Button colour="negative" {working} clickHandler={() => updateCollection(selectedCollection)}
        >Yes, remove them</Button
      >
    </div>
  </Dialog>
{/if}

<style lang="scss">
</style>
