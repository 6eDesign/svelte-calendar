<script>
  import Week from './Week.svelte';
  import { sortedDaysOfWeek } from './lib/time';

  export let id;
  export let visibleMonth;
  export let visibleSecMonth;
  export let selected;
  export let selectedEnd;
  export let highlighted;
  export let shouldShakeDate;
  export let range;

  let lastId = id;
  let direction;

  $: {
    direction = lastId < id ? 1 : -1;
    lastId = id;
  }
</script>


<div class="month-container">
  <div class="first-month-container">
  <div class="legend">
    <div class="first-month-week">
      {#each sortedDaysOfWeek as day}
        <span>{day[1]}</span>
      {/each}
    </div>
  </div>
    {#each visibleMonth.weeks as week (week.id) }
      <Week 
        days={week.days} 
        {selected}  
        {selectedEnd}  
        {highlighted} 
        {shouldShakeDate} 
        {direction}
        on:dateSelected
      />
    {/each}
  </div>
  {#if visibleSecMonth && range}
    <div class="second-month-container">
    <div class="legend">
      <div class="second-month-week">
        {#each sortedDaysOfWeek as day}
          <span>{day[1]}</span>
        {/each}
      </div>
    </div>
      {#each visibleSecMonth.weeks as week (week.id) }
        <Week 
          days={week.days} 
          {selected} 
          {selectedEnd}  
          {highlighted} 
          {shouldShakeDate} 
          {direction}
          on:dateSelected
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .first-month-container,
  .second-month-container { 
    width: 100%;
    display: -ms-grid;
    display: grid;
    -ms-grid-columns: 1fr;
    -ms-grid-rows: 1fr;
  }
  .first-month-container {
    margin-right: 1%;
  }
  .second-month-container {
    margin-left: 1%;
  }
  @media (min-width: 600px) {
    .month-container {
      display: flex;
    }
    .first-month-week {
      width: 100%;
    }
    .second-month-week {
      width: 100%;
    }
  }

  .legend {
    display: grid;
    grid-row: 1 / 2;
    color: #4a4a4a;
    padding: 10px 0;
    margin-bottom: 5px;
  }
  .legend span {
    width: 14.285714%;
    display: inline-block;
    text-align: center;
  }
</style>
