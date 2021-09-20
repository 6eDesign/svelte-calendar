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

	const getCached = (index) => $visibleData.find(({ index: i }) => i === index)?.data || get(index);

	let inRange = [-Infinity, Infinity];
	const initialized = writable(false);
	const dim = writable({ w: 0, h: 0 });
	const offset = spring(0, { stiffness, damping });

	export const visibleData = derived(
		[dim, offset, initialized],
		([{ w, h }, $o, $initialized]) => {
			if (!w || !h || !$initialized) return [];
			if ($o < inRange[0] || $o > inRange[1]) return $visibleData;
			const cellHeight = h / cellCount;
			const start = Math.max(-1, Math.floor((-1 * $o) / cellHeight) - 1);
			const baseOffset = $o % cellHeight;
			return Array(cellCount + 2)
				.fill(0)
				.map((_, i) => {
					const index = i + start;
					const pos = baseOffset + (i - 1) * cellHeight;
					if (index < 0 || index >= itemCount) return undefined;
					return { data: getCached(index), pos, index };
				})
				.filter(Boolean);
		},
		[]
	);

	const updateOffset = (o) => {
		inRange = [o, $offset].sort((a, b) => a - b);
		offset.set(o, { hard: !$initialized });
	};

	$: type = vertical ? 'rows' : 'columns';
	$: gridStyle = `grid-template-${type}: repeat(${cellCount}, 1fr);`;
	$: {
		if ($dim.w && $dim.h) {
			const newOffset = ($dim.h / cellCount) * index * -1;
			updateOffset(+newOffset.toFixed(3));
			if (!$initialized) initialized.set(true);
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
		overflow: hidden;
		height: 100%;
		display: grid;
	}
	.grid > * {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		transition-property: none !important;
	}
</style>
