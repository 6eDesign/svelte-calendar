<script>
	import Datepicker from '$lib/components/Datepicker.svelte';
	import { dark } from '$lib/config/theme';
	import SvgThing from '$lib/docs/SvgThing.svelte';
	import dayjs from 'dayjs';

	const start = dayjs().add(-100, 'year').toDate();
	const end = dayjs().add(100, 'year').toDate();

	let selected;
	let store;
</script>

<div class="grid">
	<div class="column-primary">
		<SvgThing />
		<div class="title-section">
			<div>
				<h1>SVELTE-CALENDAR</h1>
				<pre>
          npm i -D svelte-calendar
        </pre>
			</div>
		</div>
	</div>
	<div class="column-secondary">
		<Datepicker
			defaultTheme={dark}
			theme={{ calendar: { width: '620px' } }}
			bind:store
			bind:selected
			{start}
			{end}
		/>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: center;
		text-align: center;
		height: 100%;
		background: var(--sc-theme-calendar-colors-background-primary);
	}
	.column-primary {
		display: grid;
		grid-template: 1fr / 1fr;
		text-align: left;
		/* background: #0f0b0c; */
		background: var(--sc-theme-calendar-colors-background-highlight);
		margin: 0;
		grid-column: 1;
		display: grid;
		height: 100%;
		align-items: center;
	}
	.column-primary > :global(*) {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		height: 100%;
	}
	.column-secondary {
		display: grid;
		height: 100%;
		align-items: center;
	}
	h1 {
		font-size: 8em;
		line-height: 90px;
		color: #fff;
		display: inline-block;
		margin: 0;
		z-index: 2;
		text-shadow: -5px -2px 3px rgb(0 0 0 / 18%);
	}
	.title-section {
		align-items: center;
		display: grid;
		padding: 40px;
		animation: 280ms slide-left 150ms forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
		opacity: 0;
	}
	pre {
		background: #0f0b0c;
		color: #fff;
		font-size: 2.4em;
		padding: 40px;
		animation: 280ms slide-right 200ms forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
		opacity: 0;
	}
	@keyframes slide-left {
		from {
			opacity: 0;
			transform: translateX(100px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	@keyframes slide-right {
		from {
			opacity: 0;
			transform: translateX(-100px);
		}
		to {
			opacity: 0.8;
			transform: translateX(0);
		}
	}

	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		.title-section {
			padding: 30px 18px;
		}
		h1 {
			font-size: 4.5em;
			line-height: 52px;
			margin: 15px 0;
		}
		pre {
			font-size: 1.45em;
		}
	}
</style>
