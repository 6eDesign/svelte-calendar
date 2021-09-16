<script>
	import { themeContextKey } from '$lib/context';

	import { getContext } from 'svelte';

	export let key = null;

	const store = getContext(themeContextKey);

	$: !key ? '' : Object.entries($store[key]).map(([k, v]) => `--${k}: ${v}`);
</script>
