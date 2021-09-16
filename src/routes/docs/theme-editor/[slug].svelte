<script>
	import { page } from '$app/stores';
	import Theme from '$lib/components/generic/Theme.svelte';
	import InlineCalendar from '$lib/components/InlineCalendar.svelte';
	import * as themes from '$lib/config/theme';
	import { keyControlsContextKey } from '$lib/context';
	import CodeExample from '$lib/docs/CodeExample.svelte';
	import JsonEditor from '$lib/docs/JSONEditor.svelte';
	import NavBar from '$lib/docs/NavBar.svelte';
	import NavBarItem from '$lib/docs/NavBarItem.svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const focused = writable(false);

	const getFocusSetter = (bool) => () => focused.set(bool);
	setContext(keyControlsContextKey, focused);

	let theme;
	let jsonEditor;
	let lastSlug;

	const deepCopy = (obj) =>
		Object.entries(obj).reduce(
			(acc, [k, v]) => ({
				...acc,
				[k]: typeof v === 'object' ? deepCopy(v) : v
			}),
			{}
		);

	$: {
		if ($page?.params.slug && lastSlug !== $page.params.slug) {
			lastSlug = $page.params.slug;
			theme = deepCopy(themes[lastSlug]);
			jsonEditor?.set(theme);
		}
	}
</script>

<Theme {theme} let:style>
	<CodeExample gridTemplate="1fr / 1fr 2fr" {style}>
		<div
			class="json"
			slot="code"
			on:mouseover={getFocusSetter(true)}
			on:mouseout={getFocusSetter(false)}
			on:focus={getFocusSetter(true)}
			on:blur={getFocusSetter(false)}
		>
			<JsonEditor bind:json={theme} bind:this={jsonEditor} />
			<NavBar>
				<NavBarItem href="/docs/theme-editor/light">Light</NavBarItem>
				<NavBarItem href="/docs/theme-editor/dark">Dark</NavBarItem>
			</NavBar>
		</div>
		<div class="results-panel">
			<div />
			<InlineCalendar {theme} />
			<div />
		</div>
	</CodeExample>
</Theme>

<style>
	.results-panel,
	.results-panel :global(*) {
		transition: all 180ms linear;
	}

	.results-panel {
		display: grid;
		height: 100%;
		grid-template: auto / 1fr auto 1fr;
		background: var(--sc-theme-calendar-colors-background-primary);
		padding: 20px 0;
		align-items: center;
	}

	.json {
		display: grid;
		grid-template-rows: 1fr auto;
	}

	.json > :global(*) {
		display: grid;
		height: 100%;
	}
</style>
