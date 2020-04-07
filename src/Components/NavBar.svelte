<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { contextKey } from './lib/context';
  import { monthsOfYear } from './lib/time';

  const { config } = getContext(contextKey);
  const dispatch = createEventDispatcher();

  export let month;
  export let secMonth;
  export let start;
  export let end;
  export let year;
  export let secYear;
  export let canIncrementMonth;
  export let canDecrementMonth;
  export let canIncrementSecMonth;
  export let canDecrementSecMonth;

  let monthSelectorOpen = false;
  let availableMonths;

  $: {
    let isOnLowerBoundary = start.getFullYear() === (year || secYear);
    let isOnUpperBoundary = end.getFullYear() === (year || secYear);
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
    if (!monthDefinition.selectable) return;
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
      <span>{monthsOfYear[month][0]} {year}</span>
    </div> 
    <div class="control"
      class:enabled={canIncrementMonth}
      on:click={() => dispatch('incrementMonth', 1)}>
      <i class="arrow right"></i>
    </div>
  </div>
  <div class="month-selector" class:open={monthSelectorOpen}>
      {#each availableMonths as monthDefinition, index}
        <div 
          class="month-selector--month" 
          class:selected={index === month}
          class:selectable={monthDefinition.selectable}
          on:click={e => monthSelected(e, index)}
        >
          <span>{monthDefinition.abbrev}</span>
        </div>
      {/each}
  </div>
{#if config.isRangePicker}
  <div class="heading-section">
    <div class="control" 
      class:enabled={canDecrementSecMonth}
      on:click={() => dispatch('incrementSecMonth', -1)}>
      <i class="arrow left"></i>
    </div>
    <div class="label" on:click={toggleMonthSelectorOpen}>
      <span>{monthsOfYear[secMonth][0]} {secYear}</span>
    </div> 
    <div class="control"
      class:enabled={canIncrementSecMonth}
      on:click={() => dispatch('incrementSecMonth', 1)}>
      <i class="arrow right"></i>
    </div>
  </div>
  <div class="month-selector" class:open={monthSelectorOpen}>
    {#each availableMonths as monthDefinition, index}
      <div 
        class="month-selector--month" 
        class:selected={index === secMonth}
        class:selectable={monthDefinition.selectable}
        on:click={e => monthSelected(e, { monthDefinition, index })}
      >
        <span>{monthDefinition.abbrev}</span>
      </div>
    {/each}
  </div>
{/if}
</div>

<style>
  .heading-section { 
    font-size: 16px;
    padding: 24px 15px;
    display: flex;
    width: 100%;
    justify-content: space-between;
    color: #3d4548;
    font-weight: bold;
  }
  .label,
  .title { 
    cursor: pointer;
    display: flex;
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
  .month-selector--month { 
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
  .control { 
    padding: 0 3px;
    opacity: 0.2;
    transform: translateY(3px);
  }

  .control.enabled { 
    opacity: 1; 
    cursor: pointer;
  }

  .arrow {
    display: inline-block;
    width: 15px;
    height: 15px;
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

  @media (min-width: 600px) {
    .arrow {
      width: 18px;
      height: 18px;
    }
    .control {
      padding: 0 8px;
    }
    .heading-section { 
      font-size: 20px;
    }
    .label {
      margin-left: 5%;
    }
  }
</style>
