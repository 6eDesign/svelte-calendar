<script>
  import { areDatesEquivalent, isDateBetweenSelected } from './lib/helpers';
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import { contextKey } from './lib/context';
  import { getContext } from 'svelte';

  const { config } = getContext(contextKey);

  const dispatch = createEventDispatcher();

  export let days;
  export let selected;
  export let selectedEnd;
  export let highlighted;
  export let shouldShakeDate;
  export let direction;
</script>

<div 
  class="week" 
  in:fly|local={{ x: direction * 50, duration: 180, delay: 90 }}
>
  {#each days as day}
    {#if selectedEnd}
      <div 
        class="day"
        class:is-range-picker={config.isRangePicker}
        class:outside-month={!day.partOfMonth}
        class:first-of-month={day.firstOfMonth}
        class:last-of-month={day.lastOfMonth}
        class:selected={areDatesEquivalent(day.date, selected)}
        class:selectedEnd={areDatesEquivalent(day.date, selectedEnd)}
        class:betweenSelected={isDateBetweenSelected(selected, selectedEnd, day.date)}
        class:is-today={
          day.isToday
          && selected === selectedEnd
          && !isDateBetweenSelected(selected, selectedEnd, day.date)
        }
        class:is-disabled={!day.selectable}
      >
        <button 
          class="day--label" 
          class:highlighted={areDatesEquivalent(day.date, highlighted)}
          class:shake-date={shouldShakeDate && areDatesEquivalent(day.date, shouldShakeDate)}
          class:disabled={!day.selectable}
          type="button"
          on:click={() => dispatch('dateSelected', day.date)}
        >
          {day.date.getDate()}
        </button>
      </div>
    {:else}
      <div 
        class="day" 
        class:outside-month={!day.partOfMonth}
        class:is-range-picker={config.isRangePicker}
        class:selected={areDatesEquivalent(day.date, selected)}
        class:is-today={day.isToday}
        class:is-disabled={!day.selectable}
      >
        <button 
          class="day--label" 
          class:highlighted={areDatesEquivalent(day.date, highlighted)}
          class:shake-date={shouldShakeDate && areDatesEquivalent(day.date, shouldShakeDate)}
          class:disabled={!day.selectable}
          type="button"
          on:click={() => dispatch('dateSelected', day.date)}
        >
          {day.date.getDate()}
        </button>
      </div>
    {/if}
  {/each}
</div>

<style>
  .week { 
    margin: 3px 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
  }
  .week:nth-child(6n + 1) { 
    -ms-grid-row: 7; 
    grid-row: 7; 
  }
  .week:nth-child(6n + 2) { 
    -ms-grid-row: 2; 
    grid-row: 2; 
  }
  .week:nth-child(6n + 3) { 
    -ms-grid-row: 3; 
    grid-row: 3; 
  }
  .week:nth-child(6n + 4) { 
    -ms-grid-row: 4; 
    grid-row: 4; 
  }
  .week:nth-child(6n + 5) { 
    -ms-grid-row: 5; 
    grid-row: 5; 
  }
  .week:nth-child(6n + 6) { 
    -ms-grid-row: 6; 
    grid-row: 6; 
  }
  .day { 
    flex: 1 0 auto;
    height: 32px;
    display: flex; 
    flex-basis: 0;
    justify-content: center;
    position: relative;
  }
  .day.outside-month, 
  .day.is-disabled { 
    opacity: 0.35;
  }
  .day:before { 
    content: '';
    float: left;
  }
  .day--label { 
    color: var(--day-text-color);
    display: flex;
    justify-content: center;
    width: 32px;
    height: 32px;
    position: relative;
    border: 1px solid var(--button-background-color);
    border-radius: 50%; 
    align-items: center;
    background: var(--day-background-color);
    cursor: pointer;
    transition: all 100ms linear;
    border: none;
    outline: none;
  }
  .day--label.disabled { 
    cursor: default;
  }
  .day--label.shake-date { 
    animation: shake 0.4s 1 linear;
  }
  .day.is-today.selectedEnd:not(.outside-month) .day--label,
  .day.selectedEnd:not(.outside-month) .day--label {
    background-color: var(--button-background-color);
    border: var(--highlight-color) 1px solid;
  }
  .day.selectedEnd:not(.outside-month) .day--label:hover,
  .day.selected:not(.outside-month) .day--label {
    background-color: var(--highlight-color);
    color: var(--button-background-color);
  }
  .day.betweenSelected:before, 
  .day.selected:before, 
  .day.selectedEnd:before {
    content: "";
    position: absolute;
    height: 32px;
    width: 100%;
  }
  .day.is-range-picker.betweenSelected:before, 
  .day.is-range-picker.selected:before, 
  .day.is-range-picker.selectedEnd:before {
    background-color: var(--passive-highlight-color);
  }
  .day.selected:before, 
  .day.selectedEnd:before {
    width: 50%;
  }
  .day.selected:before {
    right: 0;
  }
  .day.selectedEnd:before {
    left: 0;
  }
  .day.is-range-picker.betweenSelected:hover {
    background-color: var(--passive-highlight-color);
    border-color: var(--passive-highlight-color);
    color: var(--button-background-color);
  }
  .day.is-range-picker.selected .day--label:hover {
    background-color: var(--passive-highlight-color);
    border: var(--highlight-color) 1px solid;
  }
  @media (min-width: 480px) { 
    .day--label.highlighted,
    .day--label:not(.disabled):hover { 
      background: var(--day-highlighted-background-color);
      border-color: var(--day-highlighted-background-color);
      color: var(--day-highlighted-text-color);
    }
  }
  .day.outside-month.selected.selectedEnd.is-today .day--label.highlighted,
  .day.outside-month.is-today .day--label.highlighted,
  .day.outside-month.betweenSelected:before,
  .day.outside-month.betweenSelected:hover,
  .day.outside-month.betweenSelected,
  .day.outside-month.selectedEnd:before,
  .day.outside-month.selected:before,
  .day.outside-month.selectedEnd,
  .day.outside-month.selected,
  .day.selected.selectedEnd:before,
  .day.first-of-month:not(.outside-month).betweenSelected:before,
  .day.last-of-month:not(.outside-month).betweenSelected:before {
    background-color: transparent;
    border: none;
    color: var(--day-text-color);
  }
  .day.betweenSelected:not(.outside-month) .day--label.highlighted {
    background-color: transparent;
  }
  .day.betweenSelected:not(.outside-month) .day--label:hover {
    background-color: var(--highlight-color);
  }
  .day:not(.outside-month).betweenSelected .day--label {
    color: var(--button-background-color);
  }
  .day.is-range-picker.first-of-month:not(.outside-month).selectedEnd:not(.selected):before,
  .day.is-range-picker.first-of-month:not(.outside-month).betweenSelected {
    background: linear-gradient(to left, var(--passive-highlight-color) 70%, var(--button-background-color));
  }
  .day.is-range-picker.last-of-month:not(.outside-month).selected:not(.selectedEnd):before,
  .day.is-range-picker.last-of-month:not(.outside-month).betweenSelected {
    background: linear-gradient(to right, var(--passive-highlight-color) 70%, var(--button-background-color));
  }
  .day.is-today .day--label,
  .day.selected.selectedEnd.is-today .day--label {
    opacity: 1; 
    background: none;
    border: var(--highlight-color)  1px solid;
    color: #000;
  }
  @keyframes shake {
    0% { transform: translate(7px); }
    20% { transform: translate(-7px); }
    40% { transform: translate(3px); }
    60% { transform: translate(-3px); }
    80% { transform: translate(1px); }
    100% { transform: translate(0px); }
  }
</style>
