# svelte-calendar

A small date picker built with Svelte 3. Demo available here: [demo page].

## Basic usage

```html
<Datepicker />
```

## With custom settings

```html
<Datepicker
  format={dateFormat}
  start={threeDaysInPast}
  end={inThirtyDays}
  selectableCallback={noWeekendsSelectableCallback}
/>
```

`start` and `end` are [`Date`] objects.

`format` Date formatting uses [`timeUtils`] formatting (MM/DD/YYYY by default).

`selectableCallback` should be a function that accepts a single date as an argument and returns true (if selectable) or false (if unavailable).

More examples can be found on the [demo page].

## Binding data

```html
<Datepicker
  bind:selected
  bind:formattedSelected
  bind:dateChosen
/>
```

`selected` is a [`Date`] object. `formattedSelected` is a string - it's the `Date` object formatted using [`timeUtils`].

`dateChosen` is a boolean, false by default, true after user selection.

## Developing/Modifying Svelte-Calendar Guide

*Note that you will need to have [Node.js] installed.*

Install the dependencies...

```bash
cd svelte-calendar
npm install
```

...then start [Rollup]:

```bash
npm run dev
```

Navigate to [localhost:5000]. You should see your app running. Edit a component file in `src`, save it, and your browser will reload the page so you can see your changes automatically.

[demo page]: https://6edesign.github.io/svelte-calendar/
[`timeUtils`]: https://github.com/6eDesign/timeUtils
[`Date`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[Node.js]: https://nodejs.org
[Rollup]: https://rollupjs.org
[localhost:5000]: http://localhost:5000
