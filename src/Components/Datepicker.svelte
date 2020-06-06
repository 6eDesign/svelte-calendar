<script>
  import Months from './Month.svelte';
  import NavBar from './NavBar.svelte';
  import Popover from './Popover.svelte';
  import { formatDate } from 'timeUtils';
  import { getMonths } from './lib/helpers';
  import { contextKey } from './lib/context';
  import { keyCodes, keyCodesArray } from './lib/keyCodes';
  import { onMount, createEventDispatcher, setContext } from 'svelte';

  const dispatch = createEventDispatcher();
  const today = new Date();

  export let rangePicker = false;
  export let format = '#{m} / #{d} / #{Y}';
  export let start = new Date(1987, 9, 29);
  export let end = new Date(2020, 9, 29);
  export let selected = today;
  export let selectedEnd = rangePicker ? today : null;
  export let dateChosen = false;
  export let dateChosenEnd = false;
  export let trigger = null;
  export let selectableCallback = null;
  export let weekStart = 0;

  const config = {
    isRangePicker: rangePicker
  };

  setContext(contextKey, {
    config
  });

  selected = (
    selected.getTime() < start.getTime()
    || selected.getTime() > end.getTime()
  ) ? start : selected;

  export let style = '';
  export let buttonBackgroundColor = '#fff';
  export let buttonBorderColor = '#eee';
  export let buttonTextColor = '#333';
  export let highlightColor = '#f7901e';
  export let passiveHighlightColor = '#FCD9B1';
  export let dayBackgroundColor = 'none';
  export let dayTextColor = '#4a4a4a';
  export let dayHighlightedBackgroundColor = '#efefef';
  export let dayHighlightedTextColor = '#4a4a4a';

  let popover;
  let firstDate = true;
  let width = rangePicker ? null : 340;

  let highlighted = today;
  let shouldShakeDate = false;
  let shakeHighlightTimeout;
  let month = today && today.getMonth();
  let secMonth = today && today.getMonth();
  let year = today && today.getFullYear();
  let secYear = today && today.getFullYear();

  let isOpen = false;
  let isClosing = false;

  today.setHours(0, 0, 0, 0);

  $: months = getMonths(start, end, selectableCallback, weekStart);

  let monthIndex = 0;
  let secMonthIndex = 0;
  $: {
    monthIndex = 0;
    secMonthIndex = 0;
    for (let i = 0; i < months.length; i += 1) {
      if (months[i].month === month && months[i].year === year) {
        monthIndex = i;
      }
      if (config.isRangePicker && months[i].month === secMonth && months[i].year === secYear) {
        secMonthIndex = i;
      }
    }
  }
  $: visibleMonth = months[monthIndex];
  $: visibleSecMonth = months[secMonthIndex];

  $: visibleMonthsId = year + month / 100;
  $: lastVisibleDate = visibleMonth.weeks[visibleMonth.weeks.length - 1].days[6].date;
  $: firstVisibleDate = visibleMonth.weeks[0].days[0].date;
  $: canIncrementMonth = monthIndex < months.length - 1;
  $: canDecrementMonth = monthIndex > 0;
  $: canIncrementSecMonth = secMonthIndex < months.length - 1;
  $: canDecrementSecMonth = secMonthIndex > 0;
  $: wrapperStyle = `
    --button-background-color: ${buttonBackgroundColor};
    --button-border-color: ${buttonBorderColor};
    --button-text-color: ${buttonTextColor};
    --highlight-color: ${highlightColor};
    --passive-highlight-color: ${passiveHighlightColor};
    --day-background-color: ${dayBackgroundColor};
    --day-text-color: ${dayTextColor};
    --day-highlighted-background-color: ${dayHighlightedBackgroundColor};
    --day-highlighted-text-color: ${dayHighlightedTextColor};
    ${style}
  `;

  export let formattedSelected;
  export let formattedSelectedEnd;
  export let formattedCombined;
  $: {
    const isFn = typeof format === 'function';

    formattedSelected = isFn ? format(selected) : formatDate(selected, format);
    if (config.isRangePicker) {
      formattedSelectedEnd = isFn ? format(selectedEnd) : formatDate(selectedEnd, format);
    }

    formattedCombined = rangePicker ? `${formattedSelected} - ${formattedSelectedEnd}` : formattedSelected;
  }

  onMount(() => {
    month = selected.getMonth();
    year = selected.getFullYear();
  });

  function changeMonth(selectedMonth) {
    month = selectedMonth;
    highlighted = new Date(year, month, 1);
  }

  function changeSecMonth(selectedMonth) {
    secMonth = selectedMonth;
  }

  function incrementMonth(direction, date = 1) {
    if (direction === 1 && !canIncrementMonth) return;
    if (direction === -1 && !canDecrementMonth) return;
    let current = new Date(year, month, 1);
    current.setMonth(current.getMonth() + direction);
    month = current.getMonth();
    year = current.getFullYear();
    highlighted = new Date(year, month, date);
  }

  function incrementSecMonth(direction) {
    if (direction === 1 && !canIncrementSecMonth) return;
    if (direction === -1 && !canDecrementSecMonth) return;
    let current = new Date(secYear, secMonth, 1);
    current.setMonth(current.getMonth() + direction);
    secMonth = current.getMonth();
    secYear = current.getFullYear();
  }

  function getDay(m, d, y) {
    const theMonth = months.find(aMonth => aMonth.month === m && aMonth.year === y);
    if (!theMonth) return null;
    for (let i = 0; i < theMonth.weeks.length; i += 1) {
      for (let j = 0; j < theMonth.weeks[i].days.length; j += 1) {
        let aDay = theMonth.weeks[i].days[j];
        if (aDay.month === m && aDay.day === d && aDay.year === y) return aDay;
      }
    }
    return null;
  }

  function incrementDayHighlighted(amount) {
    let proposedDate = new Date(highlighted);
    proposedDate.setDate(highlighted.getDate() + amount);
    let correspondingDayObj = getDay(
      proposedDate.getMonth(),
      proposedDate.getDate(),
      proposedDate.getFullYear()
    );
    if (!correspondingDayObj || !correspondingDayObj.isInRange) return;
    highlighted = proposedDate;
    if (amount > 0 && highlighted > lastVisibleDate) {
      incrementMonth(1, highlighted.getDate());
    }
    if (amount < 0 && highlighted < firstVisibleDate) {
      incrementMonth(-1, highlighted.getDate());
    }
  }

  function checkIfVisibleDateIsSelectable(date) {
    const proposedDay = getDay(
      date.getMonth(),
      date.getDate(),
      date.getFullYear()
    );
    return proposedDay && proposedDay.selectable;
  }

  function shakeDate(date) {
    clearTimeout(shakeHighlightTimeout);
    shouldShakeDate = date;
    shakeHighlightTimeout = setTimeout(() => {
      shouldShakeDate = false;
    }, 700);
  }

  function assignValueToTrigger(formatted) {
    if (!trigger) { return; }
    trigger.innerHTML = formatted;
  }

  function handleKeyPress(evt) {
    if (keyCodesArray.indexOf(evt.keyCode) === -1) return false;
    evt.preventDefault();
    switch (evt.keyCode) {
      case keyCodes.left:
        return incrementDayHighlighted(-1);
      case keyCodes.up:
        return incrementDayHighlighted(-7);
      case keyCodes.right:
        return incrementDayHighlighted(1);
      case keyCodes.down:
        return incrementDayHighlighted(7);
      case keyCodes.pgup:
        return incrementMonth(-1);
      case keyCodes.pgdown:
        return incrementMonth(1);
      case keyCodes.escape:
        // eslint-disable-next-line
        return close();
      case keyCodes.enter:
        // eslint-disable-next-line
        return registerSelection(highlighted);
      default:
        return false;
    }
  }

  function registerClose() {
    document.removeEventListener('keydown', handleKeyPress);
    dispatch('close');
  }

  function close() {
    popover.close();
    registerClose();
  }

  function registerSelection(chosen) {
    if (!checkIfVisibleDateIsSelectable(chosen)) {
      return shakeDate(chosen);
    }

    if (!config.isRangePicker) {
      selected = chosen;
      dateChosen = true;
      assignValueToTrigger(formattedSelected);
      close();
      return dispatch('dateSelected', { date: selected });
    }

    if (firstDate) {
      if (dateChosen) {
        selectedEnd = chosen;
      }
      if (chosen <= selectedEnd || !dateChosen) {
        selected = chosen;
        selectedEnd = selected;
      }
      dateChosen = true;
    } else {
      if (chosen >= selected) {
        selectedEnd = chosen;
      } else {
        selectedEnd = selected;
        selected = chosen;
      }
      close();
      dateChosenEnd = true;
    }
  
    assignValueToTrigger(formattedSelected);
    assignValueToTrigger(formattedSelectedEnd);
  
    if (!firstDate) {
      dispatch('dateSelected', { from: selected, to: selectedEnd });
    }

    firstDate = !firstDate;
    return true;
  }

  function registerOpen() {
    highlighted = new Date(selected);
    month = selected.getMonth();
    year = selected.getFullYear();

    if (config.isRangePicker) {
      if (selected.getMonth() === selectedEnd.getMonth()
      && selected.getFullYear() === selectedEnd.getFullYear()) {
        secMonth = selected.getMonth() + 1;
        secYear = selected.getFullYear();
      } else {
        secMonth = selectedEnd.getMonth();
        secYear = selectedEnd.getFullYear();
      }
    }
    document.addEventListener('keydown', handleKeyPress);
    dispatch('open');
  }
</script>

<style>
  .datepicker {
    display: inline-block;
    text-align: center;
    overflow: visible;
  }

  .calendar-button {
    padding: 10px 20px;
    border: 1px solid var(--button-border-color);
    display: block;
    text-align: center;
    width: 300px;
    text-decoration: none;
    cursor: pointer;
    background: var(--button-background-color);
    color: var(--button-text-color);
    border-radius: 7px;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  .calendar {
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    user-select: none;
    width: 100vw;
    padding: 10px;
    padding-top: 0;
  }
  
  @media (min-width: 600px) {
    .calendar {
      height: auto;
      width: 680px;
      max-width: 100%;
    }
  }
</style>

<div
  class="datepicker"
  class:open={isOpen}
  class:closing={isClosing}
  style={wrapperStyle}>
  <Popover
    {trigger}
    bind:this={popover}
    bind:open={isOpen}
    bind:shrink={isClosing}
    on:opened={registerOpen}
    on:closed={registerClose}>
    <div slot="trigger">
      <slot>
        {#if !trigger}
          <button class="calendar-button" type="button">
            {formattedCombined}
          </button>
        {/if}
      </slot>
    </div>
    <div slot="contents">
      <div class="calendar" style="width: {width}px">
        <NavBar
          {month}
          {secMonth}
          {year}
          {secYear}
          {start}
          {end}
          {canIncrementMonth}
          {canDecrementMonth}
          {canIncrementSecMonth}
          {canDecrementSecMonth}
          on:monthSelected={e => changeMonth(e.detail)}
          on:monthSelected={e => changeSecMonth(e.detail)}
          on:incrementMonth={e => incrementMonth(e.detail)}
          on:incrementSecMonth={e => incrementSecMonth(e.detail)} />
        <Months
          {visibleMonth}
          {visibleSecMonth}
          {selected}
          {selectedEnd}
          {highlighted}
          {shouldShakeDate}
          id={visibleMonthsId}
          on:dateSelected={e => registerSelection(e.detail)} />
      </div>
    </div>
  </Popover>
</div>
