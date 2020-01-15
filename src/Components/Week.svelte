<script>
  import { areDatesEquivalent, isDateBetweenSelected } from './lib/helpers';
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

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
  in:fly={{ x: direction * 50, duration: 180, delay: 90 }}
  out:fade={{ duration: 180 }}
>
  {#each days as day}
    {#if selectedEnd}
      <div 
        class="day" 
        class:outside-month={!day.partOfMonth}
        class:first-of-month={day.firstOfMonth}
        class:last-of-month={day.lastOfMonth}
        class:is-today={day.isToday && !isDateBetweenSelected(selected, selectedEnd, day.date)}
        class:is-disabled={!day.selectable}
      >
        <button 
          class="day--label" 
          class:selected={areDatesEquivalent(day.date, selected)}
          class:selectedEnd={areDatesEquivalent(day.date, selectedEnd)}
          class:betweenSelected={isDateBetweenSelected(selected, selectedEnd, day.date)}
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
        class:is-today={day.isToday}
        class:is-disabled={!day.selectable}
      >
        <button 
          class="day--label" 
          class:selected={areDatesEquivalent(day.date, selected)}
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
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    flex-flow: row;
    -webkit-flex-flow: row;
    justify-content: space-around;
    -ms-grid-column: 1;
    grid-column: 1; 
  }
  .week:nth-child(6n + 1) { 
    -ms-grid-row: 1; 
    grid-row: 1; 
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
    margin: 2px;
    color: var(--day-text-color);
    font-weight: bold;
    text-align: center;
    font-size: 16px;
    flex: 1 0 auto;
    height: auto;
    display: flex; 
    flex-basis: 0;
  }
  .day.outside-month, 
  .day.is-disabled { 
    opacity: 0.35;
  }
  .day:before { 
    content: '';
    float: left;
    padding-top: 100%;
  }
  .day--label { 
    color: var(--day-text-color);
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    position: relative;
    border: 1px solid #fff;
    border-radius: 50%; 
    margin: 10%;
    padding: 0;
    align-items: center;
    background: var(--day-background-color);
    cursor: pointer;
    transition: all 100ms linear;
    font-weight: normal;
    z-index: 1;
  }
  .day--label.disabled { 
    cursor: default;
  }
  @media (min-width: 480px) { 
    .day--label.highlighted,
    .day--label:not(.disabled):hover { 
      background: var(--day-highlighted-background-color);
      border-color: var(--day-highlighted-background-color);
      color: var(--day-highlighted-text-color);
    }
  }
  .day--label.shake-date { 
    animation: shake 0.4s 1 linear;
  }
  .day.is-today .day--label.selected,
  .day.is-today .day--label.selectedEnd:hover,
  .day--label.selected.selectedEnd,
  .day--label.selected:hover,
  .day--label.selected,
  .day--label.selectedEnd:hover,
  .day--label.selectedEnd,
  .day--label:active:not(.disabled) { 
    background-color: var(--highlight-color);
    border-color: var(--highlight-color);
    color: #fff;
    border-radius: 50%;
    transform-style: preserve-3d;
    outline: none;
  }
  .day.is-today .day--label.selectedEnd,
  .day--label.selectedEnd {
    background-color: white;
    color: var(--day-text-color);
  }
  .day--label.betweenSelected:before, 
  .day--label.selected:after, 
  .day--label.selectedEnd:after {
    content: "";
    background-color: var(--passive-highlight-color);
    position: absolute;
    height: 105%;
    width: 116%;
  }
  .day--label.selected:after, 
  .day--label.selectedEnd:after {
    width: 75%;
    transform: translateZ(-1px);    
  }
  .day--label.betweenSelected:before {
    z-index: -1;
  }
  .day--label.selected:after {
    left: 15px;
  }
  .day--label.selectedEnd:after {
    right: 15px;
  }
  .day--label.betweenSelected {
    transition: none;
    border-radius: 0;
    margin: 10% -6%;
    width: 116%;
    color: #fff;
  }
  .day.outside-month .day--label.betweenSelected:before,
  .day.outside-month .day--label.betweenSelected:hover,
  .day.outside-month .day--label.betweenSelected,
  .day.outside-month .day--label.selectedEnd:after,
  .day.outside-month .day--label.selected:after,
  .day.outside-month .day--label.selectedEnd,
  .day.outside-month .day--label.selected {
    background-color: transparent;
    border-color: transparent;
    color: var(--day-text-color);
  }
  .day--label.betweenSelected:hover {
    background-color: var(--passive-highlight-color);
    border-color: var(--passive-highlight-color);
    color: #fff;
  }
  .day.first-of-month:not(.outside-month) .day--label.betweenSelected:hover:before,
  .day.last-of-month:not(.outside-month) .day--label.betweenSelected:hover:before,
  .day--label.betweenSelected:hover:before {
    border-radius: 50%;
    background-color: var(--highlight-color);
    width: 32.6px;
    height: 32.6px;
    z-index: -1;
  }
  .day--label.selected.selectedEnd.highlighted:after,
  .day--label.selected.selectedEnd:after,
  .day.first-of-month:not(.outside-month) .day--label.betweenSelected:before,
  .day.last-of-month:not(.outside-month) .day--label.betweenSelected:before {
    background-color: transparent;
  }
  .week:nth-child(6n + 1) .day--label.betweenSelected {
    height: 80%;
  }
  .week:nth-child(6n + 1) .day--label.betweenSelected:hover,
  .week:nth-child(6n + 2) .day--label.betweenSelected:hover {
    height: 78%;
  }
  .week:nth-child(6n + 4) .day--label.betweenSelected:hover,
  .week:nth-child(6n + 5) .day--label.betweenSelected:hover {
    margin-top: 11%;
  }
  .week:nth-child(6n + 4) .day--label.selected,
  .week:nth-child(6n + 4) .day--label.selectedEnd,
  .week:nth-child(6n + 5) .day--label.selected,
  .week:nth-child(6n + 5) .day--label.selectedEnd {
    margin-top: 11%;
  }
  .day.first-of-month:not(.outside-month) .day--label.betweenSelected {
    background: linear-gradient(to left, var(--passive-highlight-color) 70%, white);
    border: none;
    margin-top: 9%;
    height: 80%;
  }
  .day.last-of-month:not(.outside-month) .day--label.betweenSelected {
    background: linear-gradient(to right, var(--passive-highlight-color) 70%, white);
    border: none;
    margin-top: 11%;
  }
  .day.is-today .day--label { 
    opacity: 1; 
    background: none;
    border-color: var(--highlight-color);
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
