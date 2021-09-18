<script>
	import { KEY_CODES } from '$lib/config';
	import { keyControlsContextKey } from '$lib/context';
	import { getContext } from 'svelte';

	export let ctx = null;

	const currentCtx = getContext(keyControlsContextKey);

	const key = (evt) => {
		if (ctx && !ctx.includes($currentCtx)) return;
		const mapping = $$props[KEY_CODES[evt.keyCode]];
		if (mapping) mapping();
	};

	$: eventHandler = key;
</script>

<svelte:window on:keydown={eventHandler} />

<slot />
