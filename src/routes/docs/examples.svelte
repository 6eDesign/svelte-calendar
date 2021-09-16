<script>
	import Crossfade from '$lib/components/generic/crossfade/Crossfade.svelte';
	import Theme from '$lib/components/generic/Theme.svelte';
	import { dark } from '$lib/config/theme';
	import blurr from '$lib/directives/blurr';
	import Code from '$lib/docs/Code.svelte';
	import CodeExample from '$lib/docs/CodeExample.svelte';
	import DocPage from '$lib/docs/DocPage.svelte';

	// @example(quickStart, QuickStart.svelte)
	// @example(startAndEnd, StartAndEnd.svelte)
	// @example(inlineCalendar, InlineCalendar.svelte)
	// @example(darkTheme, DarkTheme.svelte)
	// @example(customTheme, CustomTheme.svelte)
	// @example(formatting, Formatting.svelte)
	// @example(storeExample, Store.svelte)
	// @example(localeExample, Locale.svelte)
	// @example(customTrigger, CustomTrigger.svelte)

	let example = null;

	const examples = [
		{
			title: 'Quick Start',
			component: quickStart.component,
			code: quickStart.code
		},
		{
			title: 'Start & End',
			component: startAndEnd.component,
			code: startAndEnd.code
		},
		{
			title: 'Inline Calendar',
			component: inlineCalendar.component,
			code: inlineCalendar.code
		},
		{
			title: 'Dark Theme',
			component: darkTheme.component,
			code: darkTheme.code
		},
		{
			title: 'Custom Theme',
			component: customTheme.component,
			code: customTheme.code
		},
		{
			title: 'Formatting',
			component: formatting.component,
			code: formatting.code
		},
		{
			title: 'Accessing Store',
			component: storeExample.component,
			code: storeExample.code
		},
		{
			title: 'Locale',
			component: localeExample.component,
			code: localeExample.code
		},
		{
			title: 'Custom Trigger',
			component: customTrigger.component,
			code: customTrigger.code
		}
	];

	// todo: work out fix for switching between examples
	const openExample = (ex) => () => {
		example = ex;
	};

	const closeExample = () => {
		example = null;
	};
</script>

<Crossfade let:key let:send let:receive>
	<DocPage>
		<svelte:fragment slot="title">Examples</svelte:fragment>
		<div class="grid">
			{#each examples as ex}
				<div>
					{#if example !== ex}
						<a
							href="#example"
							in:receive|local={{ key }}
							out:send|local={{ key }}
							on:click|preventDefault={openExample(ex)}>{ex.title}</a
						>
					{/if}
				</div>
			{/each}
		</div>
	</DocPage>
	{#if example}
		<Theme theme={dark} let:style>
			<div
				class="modal"
				{style}
				use:blurr
				on:blurr={closeExample}
				in:receive|local={{ key }}
				out:send|local={{ key }}
			>
				<CodeExample>
					<div class="code" slot="code"><Code pretranslated={example.code} /></div>
					<div class="result-column">
						<h1>
							{example.title}
							<button on:click={closeExample}>X</button>
						</h1>
						<div class="example">
							<svelte:component this={example.component} />
						</div>
					</div>
				</CodeExample>
			</div>
		</Theme>
	{/if}
</Crossfade>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		column-gap: 10px;
		row-gap: 10px;
	}
	@media (max-width: 720px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.grid > div {
		background: var(--sc-theme-calendar-colors-background-primary);
	}
	a {
		height: 80px;
		text-align: center;
		display: grid;
		align-items: center;
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		box-shadow: var(--sc-theme-calendar-shadow);
		font-size: 1.4em;
		text-decoration: none;
		transition: all 180ms linear;
	}
	a:hover {
		background: var(--sc-theme-calendar-colors-background-hover);
	}
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 95vw;
		min-height: 700px;
		background: #fff;
		box-shadow: var(--sc-theme-calendar-shadow);
		display: grid;
		grid-template-columns: 1fr auto;
		z-index: 3;
	}

	.modal .code {
		display: grid;
		height: 100%;
		overflow-y: auto;
	}

	.modal .code > :global(*) {
		padding: 35px;
	}

	.modal .result-column {
		display: grid;
		grid-template-rows: auto 1fr;
		min-width: 57vw;
	}

	.modal .result-column h1 {
		margin: 0;
		padding: 20px;
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.modal .result-column h1 button {
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		box-shadow: 3px 3px 5px 5px rgba(0, 0, 0, 0.18);
		border: 0;
		padding: 14px;
		border-radius: 8px;
		font-size: 18px;
		cursor: pointer;
	}

	.modal .example {
		display: grid;
		padding: 20px;
		grid-template-rows: auto auto 1fr;
		grid-template-rows: 1fr auto auto;
		align-items: center;
		height: 100%;
		text-align: center;
		align-items: center;
	}

	@media (min-width: 720px) {
		.modal .example {
		}
	}

	@media (max-width: 720px) {
		.modal {
			width: 100vw;
			height: 100vh;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
		}
		.modal .example {
			padding: 20px 0;
		}
	}

	.modal .example > :global(*) {
		margin: 0 auto;
	}

	.modal .example > :global(p) {
		margin-top: 30px;
		color: #666;
	}

	.modal .example > :global(p a) {
		font-weight: bold;
	}
</style>
