<script>
  import '../app.css';
  import Splash from '$lib/components/Splash.svelte';
  import Notifier from '$lib/components/Notifier.svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SideButton from '$lib/components/SideButton.svelte';
</script>

<svelte:head><title>{import.meta.env.VITE_SITE_NAME}</title></svelte:head>
<div class="mx-auto w-full min-h-screen flex flex-col">
  <Header />
  <div class="app-container">
    <slot />
  </div>

  <Footer />
  <Splash />
  <Notifier />
  <SideButton />
</div>

<style lang="scss">
  .app-container {
    @apply p-2 container mx-auto w-full flex-1;
  }
</style>
