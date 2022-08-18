<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { Logout } from 'svelte-heros';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import Button from '$lib/components/Button.svelte';
  import { page } from '$app/stores';

  const { auth } = $page.data;

  const logOut = async () => {
    await fetch('/api/auth', {
      method: 'POST'
    });
    await invalidate('/');
    goto('/');
  };
</script>

<header class="header">
  <div class="title">
    <h1><a href="/">{import.meta.env.VITE_SITE_NAME}</a></h1>
    <h2>{import.meta.env.VITE_SITE_TAGLINE}</h2>
  </div>
  <div class="links">
    {#if auth === 'admin'}
      <a href="/magic-link">Magic Links</a>
    {/if}
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
      h1 {
        @apply text-4xl font-black tracking-wide text-neutral-900 border-b-4 hover:border-primary-400 inline-block box-border border-transparent transition-colors mb-0;
      }
      h2 {
        @apply text-sm uppercase text-neutral-400 font-bold tracking-wide;
      }
    }
    .action-buttons {
      @apply flex md:w-auto gap-2 text-sm md:text-base items-center;
    }
  }
  .links {
    @apply flex gap-4 pr-4;
    a {
      @apply text-sm uppercase text-neutral-400 font-bold tracking-wide  hover:text-neutral-700 transition-colors;
    }
  }
</style>
