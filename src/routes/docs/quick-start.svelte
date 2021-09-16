<script context="module">
	export const ssr = false;
</script>

<script>
	import Code from '$lib/docs/Code.svelte';
	import DocPage from '$lib/docs/DocPage.svelte';

	// @example(quickStart, QuickStart.svelte)

	const x = 10;
</script>

<DocPage>
	<svelte:fragment slot="title">Quick-Start</svelte:fragment>
	<ol>
		<li>
			<h3>Install with NPM or Yarn</h3>
			<Code source="npm i -D svelte-calendar" />
		</li>
		<li>
			<h3>Import and implement the datepicker</h3>
			<Code pretranslated={quickStart.code} />
		</li>
		<li>
			<h3>
				See <a href="/docs/props">props</a> &amp; <a href="/docs/examples">examples</a> for more information
			</h3>
		</li>
	</ol>
</DocPage>

<style>
	a {
		color: var(--sc-theme-calendar-colors-background-highlight);
		text-decoration: none;
		font-weight: bold;
	}

	@media (max-width: 720px) {
		ol {
			margin: 0;
			margin-left: 10px;
			padding: 0;
		}
	}
</style>
