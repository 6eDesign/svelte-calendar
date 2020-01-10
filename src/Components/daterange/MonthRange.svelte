<script>
  import Week from './Week.svelte';

  export let id;
  export let visibleMonth;
  export let visibleNextMonth;
  export let selectedStart;
  export let selectedEnd;
  export let highlighted;
  export let shouldShakeDate;

  let lastId = id;
  let direction;

  $: {
    direction = lastId < id ? 1 : -1;
    lastId = id;
  }
</script>

<div class="month-range-container">
  <div class="first-month-container">
    {#each visibleMonth.weeks as week (week.id) }
      <Week 
        days={week.days} 
        {selectedStart} 
        {selectedEnd}  
        {highlighted} 
        {shouldShakeDate} 
        {direction}
        on:dateSelected
      />
    {/each}
  </div>
  <div class="second-month-container">
    {#each visibleNextMonth.weeks as week (week.id) }
      <Week 
        days={week.days} 
        {selectedStart} 
        {selectedEnd}  
        {highlighted} 
        {shouldShakeDate} 
        {direction}
        on:dateSelected
      />
    {/each}
  </div>
</div>

<style>
  .month-range-container {
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
</style>
