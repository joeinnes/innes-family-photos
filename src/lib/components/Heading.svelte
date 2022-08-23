<script lang="ts">
  type Level = 1 | 2 | 3 | 4 | 5 | 6;
  export let level = 1;
</script>

{#if level === 1}
  <h1><slot /></h1>
  <p class="subheading-1"><slot name="subheading" /></p>
{:else if level === 2}
  <h2><slot /></h2>
{:else if level === 3}
  <h3><slot /></h3>
{:else if level === 4}
  <h4><slot /></h4>
{:else if level === 5}
  <h5><slot /></h5>
{:else if level === 6}
  <h6><slot /></h6>
{/if}

<style lang="scss">
  h1 {
    @apply text-4xl font-black tracking-wide text-neutral-900 underline inline-block box-border transition-colors mb-0 decoration-4 decoration-transparent hover:decoration-primary-400;
  }

  h2 {
    @apply text-3xl font-bold tracking-wide text-neutral-900 underline  box-border transition-colors mb-0 decoration-4 decoration-transparent hover:decoration-primary-400;
  }

  h3 {
    @apply tracking-wide underline underline-offset-4 
    decoration-4 decoration-primary-300 text-xl font-bold uppercase;
  }

  h4 {
    @apply tracking-wide underline underline-offset-4 
    decoration-4 decoration-primary-300 text-lg font-bold uppercase;
  }

  p.subheading-1 {
    @apply text-sm uppercase text-neutral-400 font-bold tracking-wide;
  }
</style>
