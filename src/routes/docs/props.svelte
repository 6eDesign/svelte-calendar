<script context="module">
	export const ssr = false;
</script>

<script>
	import Code from '$lib/docs/Code.svelte';
	import DocPage from '$lib/docs/DocPage.svelte';
	import { base } from '$app/paths';

	const props = [
		{
			name: 'selected',
			defaultVal: 'new Date()',
			description: 'The currently-selected date.'
		},
		{
			name: 'start',
			defaultVal: "dayjs().add(-100, 'year').toDate()",
			description: 'The minimum date a user can select.'
		},
		{
			name: 'end',
			defaultVal: "dayjs(start).add(100, 'year').toDate()",
			description: 'The maximum date a user can select.'
		},
		{
			name: 'format',
			defaultVal: "'MM/DD/YYYY'",
			description:
				'A `dayjs` format expression.  Used when updating the read-only `formatted` prop.'
		},
		{
			name: 'startOfWeekIndex',
			defaultVal: '0',
			description:
				'Which date.getDay() should be considered the start of the week (eg: 1 would indicate week should start on Monday)'
		},
		{
			name: 'formatted',
			defaultVal: 'undefined',
			description:
				'Readonly prop which provides a formatted version of the currently-selected date.'
		},
		{
			name: 'store',
			defaultVal: 'datepickerStore.get({ selected, start, end, startOfWeekIndex })',
			description: 'Readonly prop which provides access to the internal store.'
		},
		{
			name: 'theme',
			defaultVal: '{}',
			description: `An object containing theme/style overrides for the component.  See <a href="${base}/docs/theme-editor/light">theme-editor documentation</a>`
		},
		{
			name: 'defaultTheme',
			defaultVal: 'undefined',
			description:
				'The default theme to extend with the `theme` prop.  When this prop is not set the `light` theme will be used by default.'
		}
	];
</script>

<DocPage>
	<svelte:fragment slot="title">Props</svelte:fragment>
	<div class="table">
		<div class="table-title">Name</div>
		<div class="table-title">Default</div>
		<div class="table-title">Description</div>
		{#each props as { name, defaultVal, description }}
			<div>{name}</div>
			<Code source={defaultVal} language="js" />
			<div>
				<span>{@html description}</span>
			</div>
		{/each}
	</div>
</DocPage>

<style>
	.table {
		display: grid;
		grid-template: auto / auto auto 1fr;
		align-items: center;
		row-gap: 2px;
		column-gap: 2px;
		font-size: 1.1em;
		box-shadow: var(--sc-theme-calendar-shadow);
	}

	.table > * {
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
	}

	.table :global(a) {
		color: var(--sc-theme-calendar-colors-text-primary);
		text-decoration: none;
		font-weight: bold;
	}

	.table > :global(*) {
		padding: 18px;
		height: 100%;
		display: grid;
		align-items: center;
	}

	.table-title {
		background: var(--sc-theme-calendar-colors-background-hover);
		color: var(--sc-theme-calendar-colors-text-primary);
		font-weight: bold;
		font-size: 1.3em;
	}
</style>
