<script lang="ts">
	export let clickHandler = () => {};
	export let colour: 'primary' | 'light' | 'neutral' | 'delete';
	export let type: 'reset' | 'submit' | 'button' = 'button';
	export let forceText = false;
	export let disabled = false;
	let text = '';

	let options = {
		primary: 'text-white bg-primary-500 hover:bg-primary-600',
		light: 'bg-primary-200 hover:bg-primary-300 text-primary-900',
		neutral: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
		delete: 'bg-red-200 hover:bg-red:300 text-red-900'
	};

	let classString = options[colour] || '';
</script>

<button
	{type}
	class="{classString} rounded px-4 py-2 flex gap-2 items-center select-none transition-colors"
	class:disabled
	on:click={clickHandler}
	title={text}
	{disabled}
	><slot name="icon" /><span class={$$slots.icon && !forceText ? 'hidden md:inline' : ''}
		><slot /></span
	></button
>

<style lang="scss">
	.disabled {
		@apply opacity-70 cursor-not-allowed;
	}
</style>
