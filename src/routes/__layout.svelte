<script>
	import { page, navigating } from '$app/stores';

	import Swappable from '$lib/components/generic/Swappable.svelte';

	import Theme from '$lib/components/generic/Theme.svelte';
	import ToggleSwitch from '$lib/components/generic/ToggleSwitch.svelte';
	import { dark, light } from '$lib/config/theme';
	import NavBar from '$lib/docs/NavBar.svelte';
	import NavBarItem from '$lib/docs/NavBarItem.svelte';
	import { spring } from 'svelte/motion';

	const links = [
		{ href: '/', text: 'Home' },
		{ href: '/docs/quick-start', text: 'Quick-Start' },
		{ href: '/docs/props', text: 'Props' },
		{ href: '/docs/examples', text: 'Examples' },
		{
			href: '/docs/theme-editor/light',
			isActive: (p) => p.startsWith('/docs/theme-editor'),
			text: 'Theme Editor'
		}
	];

	let rotation = spring(0, { stiffness: 0.3, damping: 0.15 });
	let darkModeOn = true;

	$: theme = darkModeOn ? dark : light;

	$: {
		if ($navigating) {
			rotation.set(10);
			setTimeout(() => rotation.set(0), 150);
		}
	}
</script>

<Theme {theme} let:style>
	<div {style} class="container">
		<div class="header">
			<div class="stage">
				<img src="/logo.png" alt="6eDesign" style="transform: rotate({$rotation}deg);" />
			</div>
			<h1>svelte-calendar</h1>
			<div class="header-right">
				<div />
				<div>
					<ToggleSwitch bind:value={darkModeOn} />
					<span>Dark Mode</span>
				</div>
			</div>
		</div>
		<div class="body">
			<NavBar>
				{#each links as { text, ...props }}
					<NavBarItem {...props}>{text}</NavBarItem>
				{/each}
			</NavBar>
			<div class="route-wrapper">
				<slot />
				<!-- Can consider re-adding this but would want to avoid transition between theme pages -->
				<!-- <Swappable
					magnitude={0.06}
					vertical={true}
					value={$page.path}
					getId={(path) => links.findIndex(({ href }) => path === href)}
				>
          <slot />
				</Swappable> -->
			</div>
		</div>
	</div>
</Theme>

<style>
	:global(body) {
		margin: 0;
		font-family: Rajdhani, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
	}
	:global(code) {
		font-family: Rajdhani, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
			sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol' !important;
	}
	:global(html) {
		box-sizing: border-box;
	}
	:global(a) {
		text-decoration: none;
	}
	:global(*, *:before, *:after) {
		box-sizing: inherit;
	}
	.container {
		display: grid;
		height: 100vh;
		grid-template-rows: auto 1fr;
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
	}
	.route-wrapper {
		display: grid;
		overflow: hidden;
		background: var(--sc-theme-calendar-colors-background-primary);
	}
	.route-wrapper > :global(*) {
		grid-column: 1;
		grid-row: 1;
	}
	.header {
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		text-align: center;
		display: grid;
		align-items: center;
		padding: 15px;
		display: grid;
		grid-template-columns: 72px auto 1fr;
		grid-gap: 20px;
		width: auto;
	}
	.header-right {
		display: grid;
		grid-template-columns: 1fr auto;
	}
	.header-right span {
		margin-top: 5px;
		display: inline-block;
	}
	.body {
		display: grid;
		grid-template-rows: auto 1fr;
	}
	.stage {
		z-index: 2;
	}
	.stage img {
		animation: 480ms slide-right 0ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.header h1 {
		opacity: 0;
		animation: 480ms slide-right 250ms forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	@keyframes slide-right {
		from {
			opacity: 0;
			transform: translateX(-25px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
