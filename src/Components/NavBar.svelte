<script>
  import { createEventDispatcher } from 'svelte';
  import { monthsOfYear } from './lib/time';

  const dispatch = createEventDispatcher();

  export let month;
  export let year;
  export let start;
  export let end;
  export let canIncrementMonth;
  export let canDecrementMonth;
  export let range;

  let monthSelectorOpen = false;
  let availableMonths;

  $: {
    let isOnLowerBoundary = start.getFullYear() === year;
    let isOnUpperBoundary = end.getFullYear() === year;
    availableMonths = monthsOfYear.map((m, i) => {
      return Object.assign({}, {
        name: m[0],
        abbrev: m[1]
      }, {
        selectable:
          (!isOnLowerBoundary && !isOnUpperBoundary)
          || (
            (!isOnLowerBoundary || i >= start.getMonth())
            && (!isOnUpperBoundary || i <= end.getMonth())
          )
      });
    });
  }

  function toggleMonthSelectorOpen() {
    monthSelectorOpen = !monthSelectorOpen;
  }

  function monthSelected(event, { monthDefinition, index }) {
    event.stopPropagation();
    if (!monthDefinition.selectable) return false;
    dispatch('monthSelected', index);
    toggleMonthSelectorOpen();
  }
</script>

<div class="title">
  <div class="heading-section">
    <div class="control" 
      class:enabled={canDecrementMonth}
      on:click={() => dispatch('incrementMonth', -1)}>
      <i class="arrow left"></i>
    </div>
    <div class="label" on:click={toggleMonthSelectorOpen}>
      <span class="display-month">{monthsOfYear[month][0]} {year}</span>
      {#if range}
        <span class="display-month">-</span>
        <span class="display-month">
          {#if month === 11}
            {monthsOfYear[0][0]} {year + 1}
          {:else}
            {monthsOfYear[month + 1][0]} {year}
          {/if}
        </span>
      {/if}
    </div> 
    <div class="control"
      class:enabled={canIncrementMonth}
      on:click={() => dispatch('incrementMonth', 1)}>
      <i class="arrow right"></i>
    </div>
  </div>
  <div class="month-selector" class:open={monthSelectorOpen}>
    <div class="display-months">
      {#each availableMonths as monthDefinition, index}
        <div 
          class="month-selector--month" 
          class:selected={index === month}
          class:selectable={monthDefinition.selectable}
          on:click={e => monthSelected(e, { monthDefinition, index })}
        >
          <span>{monthDefinition.abbrev}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .heading-section { 
    font-size: 20px;
    padding: 24px 15px;
    display: flex;
    justify-content: space-between;
    color: #3d4548;
    font-weight: bold;
  }
  .label { 
    cursor: pointer;
    display: flex;
    width: 100%;
  }
  .display-month {
    flex: 1;
  }
  .display-month:nth-child(2) {
    max-width: 15%;
  }
  .month-selector { 
    position: absolute;
    top: 75px; 
    left: 0; 
    right: 0; 
    bottom: 0; 
    background-color: #fff;
    transition: all 300ms; 
    transform: scale(1.2); 
    opacity: 0; 
    visibility: hidden;
    z-index: 2;
    text-align: center;
  }
  .month-selector.open { 
    transform: scale(1); 
    visibility: visible;
    opacity: 1;
  }
  .month-selector--month{ 
    width: 31.333%; 
    margin: .5%; 
    height: 21.5%;
    display: inline-block;
    color: #4a4a4a;
    border: 1px solid #efefef;
    opacity: 0.2;
  }
  .month-selector--month.selectable { 
    opacity: 1; 
  }
  .month-selector--month.selectable:hover { 
    cursor: pointer;
    box-shadow: 0px 0px 3px rgba(0,0,0,0.15);
  }
  .month-selector--month.selected { 
    background: var(--highlight-color);
    color: #fff;
  }
  .display-months,
  .month-selector--month:before { 
    content: ' ';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
  .month-selector--month span { 
    vertical-align: middle; 
    display: inline-block;
  }
  .display-months {
    width: 100%;
  }
  .display-months:nth-last-child(2) {
    display: none;
  }
  @media (max-width: 480px) {
    .display-month:nth-child(2),
    .display-month:nth-child(3),
    .display-months:nth-child(2) {
      display: none;
    }
    .display-months:nth-last-child(2) {
      display: initial;
    }
  }
  .control { 
    padding: 0 8px;
    opacity: 0.2;
    transform: translateY(3px);
  }

  .control.enabled { 
    opacity: 1; 
    cursor: pointer;
  }

  .arrow {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-style: solid;
    border-color: #a9a9a9;
    border-width: 0;
    border-bottom-width: 2px;
    border-right-width: 2px;
  }

  .arrow.right {
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }

  .arrow.left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }

</style>
