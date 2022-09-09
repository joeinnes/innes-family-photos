<script lang="ts">
  import { ChevronUp } from 'svelte-heros';
  let y = 0;
  const scrollUp = () => {
    const header = document.body;
    header?.scrollIntoView({ behavior: 'smooth' });
  };
</script>

<svelte:window bind:scrollY={y} />

<button
  on:click|preventDefault={scrollUp}
  class="fixed z-50 flex cursor-pointer items-center gap-2 bottom-12 right-0 bg-neutral-50 border p-2 border-r-0 rounded-l-full transform transition-all pr-2 hover:bg-neutral-200 text-sm {y
    ? 'translate-x-0'
    : 'translate-x-full'}"
>
  <ChevronUp />
</button>
