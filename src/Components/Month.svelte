<script>
  import Week from './Week.svelte';
  import { sortedDaysOfWeek } from './lib/time';

  export let id;
  export let visibleMonth;
  export let visibleNextMonth;
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

<div class="legend">
  <div class="first-month-week">
    {#each sortedDaysOfWeek as day}
      <span>{day[1]}</span>
    {/each}
  </div>
  {#if range}
    <div class="second-month-week">
      {#each sortedDaysOfWeek as day}
        <span>{day[1]}</span>
      {/each}
    </div>
  {/if}
</div>
<div class="month-container">
  <div class="first-month-container">
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
  {#if visibleNextMonth}
    <div class="second-month-container">
      {#each visibleNextMonth.weeks as week (week.id) }
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
  .month-container {
    display: flex;
  }
  .first-month-container {
    flex: 1;
    min-width: 47.5%;
    margin-right: 2.5%;
  }
  .second-month-container {
    flex: 2;
    min-width: 47.5%;
    margin-left: 2.5%;
  }
  .first-month-container,
  .second-month-container { 
    width: 100%;
    display: -ms-grid;
    display: grid;
    -ms-grid-columns: 1fr;
    -ms-grid-rows: 1fr;
  }
  .second-month-container,
  .second-month-week {
    display: none;
  }
  @media (min-width: 480px) {
    .second-month-container {
      display: grid;
    }
    .first-month-week {
      flex: 1;
      min-width: 47.5%;
      margin-right: 2.5%;
    }
    .second-month-week {
      display: initial;
      flex: 2;
      min-width: 47.5%;
      margin-left: 2.5%;
    }
    .legend {
      display: flex;
    }
  }
  .legend {
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
