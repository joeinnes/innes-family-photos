<script lang="ts">
  export let clickHandler = () => {};
  export let colour: 'primary' | 'light' | 'neutral' | 'negative';
  export let type: 'reset' | 'submit' | 'button' = 'button';
  export let forceText = false;
  export let disabled = false;
  export let working = false;
  let text = '';

  let options = {
    primary: 'text-white bg-primary-500 hover:bg-primary-600',
    light: 'bg-primary-200 hover:bg-primary-300 text-primary-900',
    neutral: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    negative: 'bg-red-200 hover:bg-red-300 text-red-900'
  };

  let classString = options[colour] || '';
</script>

<button
  {type}
  class="{classString} rounded px-3 md:px-4 py-2 flex gap-2 items-center select-none transition-colors"
  class:disabled={disabled || working}
  on:click={clickHandler}
  title={text}
  disabled={disabled || working}
  ><slot name="icon" />

  <div class="flex gap-2 {$$slots.icon && !forceText ? 'hidden md:inline' : ''}">
    <slot />{#if working}<div class="spinner w-6 h-6" />{/if}
  </div></button
>

<style lang="scss">
  .disabled {
    @apply opacity-70 cursor-not-allowed;
  }

  .spinner {
    border: 5px solid rgba(255, 255, 255, 0.5);
    border-bottom-color: #fff;
    border-radius: 100%;
    @apply animate-spin;
  }
</style>
