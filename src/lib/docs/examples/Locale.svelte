<script>
	import 'dayjs/locale/zh-cn.js';
	import 'dayjs/locale/es.js';
	import 'dayjs/locale/ar-dz.js';
	import 'dayjs/locale/he.js';
	import dayjs from 'dayjs';
	import { InlineCalendar, themes } from '../../index';
	import { onDestroy } from 'svelte';

	const locales = ['en', 'es', 'zh-cn', 'ar-dz', 'he'];

	let locale = 'es';

	onDestroy(() => dayjs.locale('en'));
</script>

<InlineCalendar theme={themes.dark} {locale} />

<div class="button-group">
	{#each locales as loc}
		<button on:click={() => (locale = loc)} class:selected={locale === loc}>
			{loc}
		</button>
	{/each}
</div>

<!-- Example Notes -->
<p>
	List of <a href="https://unpkg.com/dayjs@1.10.6/locale.json">available locales</a> in
	<strong>dayjs</strong>
</p>

<style>
	div {
		margin-bottom: 14px;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		column-gap: 2px;
		background: var(--sc-theme-calendar-colors-border);
		border: 2px solid var(--sc-theme-calendar-colors-border);
		width: var(--sc-theme-calendar-width);
		max-width: 100vw;
	}
	button {
		border: 0;
		padding: 20px 0;
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		font-size: 1.3em;
		cursor: pointer;
		transition: all 180ms linear;
	}
	button.selected,
	button.selected:hover {
		background: var(--sc-theme-calendar-colors-background-highlight);
		color: var(--sc-theme-calendar-colors-text-highlight);
	}
	button:hover {
		background: var(--sc-theme-calendar-colors-background-hover);
	}
</style>
