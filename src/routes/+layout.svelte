<script>
  import '../app.css';
  import Splash from '$lib/components/Splash.svelte';
  import Notifier from '$lib/components/Notifier.svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SideButton from '$lib/components/SideButton.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.active) {
        reg.active.onerror = (e) => {
          console.log(e);
        };
      }
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
      }
      fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sub)
      });
    } catch (e) {
      console.log('There was a problem registering for push notifications');
    }
  });
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
