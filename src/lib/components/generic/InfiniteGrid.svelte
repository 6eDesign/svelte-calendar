<script>
	import { spring } from 'svelte/motion';
	import { derived, writable } from 'svelte/store';

	export let cellCount = 4;
	export let itemCount = 0;
	export let index = 0;
	export let vertical = true;
	export let get;
	export let stiffness = 0.065;
	export let damping = 0.9;

	export const move = (amount) => {
		index = Math.max(0, Math.min(itemCount - 1, index + amount));
	};

	const dim = writable({ w: 0, h: 0 });
	const offset = spring(0, { stiffness, damping });
	export const visibleData = derived(
		[dim, offset],
		([{ w, h }, $o]) => {
			if (!w || !h) return [];
			const cellHeight = h / cellCount;
			const start = Math.max(-1, Math.floor((-1 * $o) / cellHeight) - 1);
			const baseOffset = $o % cellHeight;
			return Array(cellCount + 2)
				.fill(0)
				.map((_, i) => {
					const index = i + start;
					const pos = baseOffset + (i - 1) * cellHeight;
					// don't recalculate unnecessarily
					if ($visibleData?.[i]?.index === index) return { ...$visibleData[i], pos };
					if (index < 0 || index >= itemCount) return undefined;
					return { data: get(index), pos, index };
				})
				.filter(Boolean);
		},
		[]
	);

	let intiailized = false;

	$: type = vertical ? 'rows' : 'columns';
	$: gridStyle = `grid-template-${type}: repeat(${cellCount}, 1fr);`;
	$: {
		if ($dim.w && $dim.h) {
			const newOffset = ((-1 * $dim.h) / cellCount) * index;
			offset.set(+newOffset.toFixed(2), { hard: !intiailized });
			if (!intiailized) intiailized = true;
		}
	}
</script>

<div class="grid" style={gridStyle} bind:clientHeight={$dim.h} bind:clientWidth={$dim.w}>
	{#each $visibleData as obj (obj.index)}
		<div style="transform: translateY({obj.pos}px)">
			<slot {...obj.data} index={obj.index} />
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
	}
	.grid > * {
		grid-row: 1;
		grid-column: 1;
		transition-property: none !important;
	}
</style>
