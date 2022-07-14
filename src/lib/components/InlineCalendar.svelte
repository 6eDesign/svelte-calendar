<script>
	import dayjs from 'dayjs';
	import datepickerStore from '$lib/stores/datepicker';
	import { keyControlsContextKey, storeContextKey } from '$lib/context';
	import { setContext } from 'svelte';
	import { derived, writable } from 'svelte/store';
	import Theme from '$lib/components/generic/Theme.svelte';
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import CrossfadeBoundary from './generic/crossfade/CrossfadeBoundary.svelte';
	import { calendar as calendarDefaults } from '$lib/config/defaults';
	import {createEventDispatcher} from 'svelte';

	let dispatch = createEventDispatcher();
	export let selected = calendarDefaults.selected;
	export let start = calendarDefaults.start;
	export let end = calendarDefaults.end;
	export let format = calendarDefaults.format;
	export let formatted = '';
	export let theme = {};
	export let defaultTheme = undefined;
	export let startOfWeekIndex = 0;
	export let store = datepickerStore.get({ selected, start, end, startOfWeekIndex });

	const focused = writable(false);

	setContext(storeContextKey, store);
	setContext(
		keyControlsContextKey,
		derived([store, focused], ([$s, $focused]) => ($focused ? $s.activeView : undefined))
	);

	const getFocusSetter = (bool) => () => focused.set(bool);

	$: selected = $store.selected;
	$: formatted = dayjs(selected).format(format);
	const dayClick = () =>{
		dispatch('dayClicked',store);
	}
</script>

<CrossfadeBoundary>
	<Theme {defaultTheme} {theme} let:style>
		<div
			{style}
			on:focus={getFocusSetter(true)}
			on:blur={getFocusSetter(false)}
			on:mouseover={getFocusSetter(true)}
			on:mouseout={getFocusSetter(false)}
		>
			<Calendar  on:dayClicked={dayClick} />
		</div>
	</Theme>
</CrossfadeBoundary>

<style>
	div {
		display: inline-block;
	}
</style>
