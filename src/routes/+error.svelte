<script>
  import { page } from '$app/stores';
  import LogIn from '$lib/components/LogIn.svelte';
  const { auth } = $page.data;
  let shouldLogIn = !auth;
  export let data;
  export let errors;
  console.error({ data, errors, $page });

  $: {
    if ($page.status === 401 || !auth) {
      shouldLogIn = true;
    } else {
      shouldLogIn = false;
    }
  }
</script>

{#if shouldLogIn}
  {#await setTimeout(() => {}, 3500) then _}
    <LogIn />
  {/await}
{:else}
  <div class="fixed top-0 bottom-0 flex flex-col justify-center items-start p-2 jtbg w-full -z-10">
    <h2 class="text-6xl my-0">{$page.status}</h2>
    <h1 class="text-8xl">{$page.error?.message ?? 'Something went wrong'}</h1>
  </div>
{/if}

<style lang="scss">
  .jtbg {
    background-image: url('/404.gif');
    background-position: center right;
    @apply bg-contain bg-no-repeat h-screen;
  }
</style>
