<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { Logout } from 'svelte-heros';
  import Heading from '$lib/components/Heading.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import Button from '$lib/components/Button.svelte';
  import { page } from '$app/stores';

  const { auth } = $page.data;

  const logOut = async () => {
    await fetch('/api/auth', {
      method: 'POST'
    });
    await invalidateAll();
    goto('/');
  };
</script>

<header class="header">
  <div class="title">
    <Heading level={1}
      ><a href="/">{import.meta.env.VITE_SITE_NAME}</a>
      <p slot="subheading">{import.meta.env.VITE_SITE_TAGLINE}</p></Heading
    >
  </div>

  <div class="links">
    {#if auth === 'admin'}
      <a href="/magic-link">Magic Links</a>
    {/if}
    <a href="/collection">Collections</a>
    <a href="/loved">Loved</a>
    <a href="/about">About</a>
  </div>
  <div class="action-buttons">
    {#if auth === 'admin'}
      <FileUpload />
    {/if}

    <Button clickHandler={logOut} colour="primary" forceText={true}
      ><Logout slot="icon" />Log Out</Button
    >
  </div>
</header>

<style lang="scss">
  .header {
    @apply flex flex-col md:flex-row justify-between items-center gap-2 w-full p-2 lg:py-4 container mx-auto;
    .title {
      @apply flex-1 w-full;
    }
    .action-buttons {
      @apply flex md:w-auto gap-2 text-sm md:text-base items-center;
    }
  }
  .links {
    @apply flex gap-4 md:pr-4;
    a {
      @apply text-sm uppercase text-neutral-400 font-bold tracking-wide  hover:text-neutral-700 transition-colors;
    }
  }
</style>
