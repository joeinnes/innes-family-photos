<script lang="ts">
	export let src = '';
</script>

<a href="/lightbox/{src}">
	<img src="/file/{src}" alt={src} />
</a>

<style lang="scss">
	img {
		max-width: 100%;
	}
</style>
