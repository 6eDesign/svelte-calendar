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
	import { base } from '$app/paths';
	import ToggleSwitch from '$lib/components/generic/ToggleSwitch.svelte';
	import datepicker from '$lib/stores/datepicker';

	const focused = writable(false);

	const getFocusSetter = (bool) => () => focused.set(bool);
	setContext(keyControlsContextKey, focused);

	let theme;
	let jsonEditor;
	let lastSlug;
	let datepickerStore;

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
				<NavBarItem href="{base}/docs/theme-editor/light">Light</NavBarItem>
				<NavBarItem href="{base}/docs/theme-editor/dark">Dark</NavBarItem>
			</NavBar>
		</div>
		<div class="secondary-column">
			<div class="settings-panel">
				{#if $datepickerStore}
					<ToggleSwitch bind:value={$datepickerStore.enlargeDay} />
					Enlarge Day
				{/if}
			</div>
			<div class="results-panel">
				<div />
				<InlineCalendar {theme} bind:store={datepickerStore} />
				<div />
			</div>
		</div>
	</CodeExample>
</Theme>

<style>
	.results-panel,
	.results-panel :global(*) {
		transition: all 180ms linear;
	}

	.secondary-column {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.settings-panel {
		display: grid;
		align-items: center;
		grid-template-columns: auto auto 1fr;
		column-gap: 10px;
		padding: 18px;
		border-bottom: 1px solid var(--sc-theme-calendar-colors-border);
	}

	.results-panel {
		display: grid;
		height: 100%;
		grid-template: 1fr / 1fr auto 1fr;
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
