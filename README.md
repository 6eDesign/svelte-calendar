# svelte-calendar

A small date picker built with Svelte 3. Demo available here: [demo page].

## Basic usage

```html
<Datepicker start={minDate} end={maxDate} />
```

## Props

prop name            | type                   | default
---------------------|------------------------|-------------------------
`start`              | `date`                 | `new Date(1987, 9, 29)`
`end`                | `date`                 | `new Date(2020, 9, 29)`
`selected`           | `date`                 | `today`
`formattedSelected`  | `string`               | `today`
`dateChosen`         | `boolean`              | `false`
`selectableCallback` | `function`             | `null`
`format`             | `string` \| `function` | `'#{m}/#{d}/#{Y}'`
`daysOfWeek`         | `array`                | En-US Locale (see below)
`monthsOfYear`       | `array`                | En-US Locale (see below)
`style`              | `string`               | ""

### `start` and `end`
These properties set the minimum and maximum dates that will be rendered by this calendar.  It is **highly** recommended that you do not leave these as their defaults and supply values which suit your application's needs.

### `selected` and `formattedSelected`
Bind to these properties to observe the selected date as either a date or a string.  Use `selected` to set the day which is selected by default.

### `dateChosen`
Bind to this property to observe whether a user has selected a day.

### `selectableCallback`
Provide a function which accepts a date and returns a boolean determining whether a day between `start` and `end` is selectable.  For example, use this to prevent weekend days from being selected.

### `format`
Date formatting uses [`timeUtils`] formatting (MM/DD/YYYY by default).  If you would like to use a different formatting library, supply a function which accepts a date and returns a string. 

### `daysOfWeek` and `monthsOfYear`
These two props are used to internationalize the calendar.  The default values are: 

```javascript
export let daysOfWeek = [
  ['Sunday', 'Sun'],
  ['Monday', 'Mon'],
  ['Tuesday', 'Tue'],
  ['Wednesday', 'Wed'],
  ['Thursday', 'Thu'],
  ['Friday', 'Fri'],
  ['Saturday', 'Sat']
];
export let monthsOfYear = [
  ['January', 'Jan'],
  ['February', 'Feb'],
  ['March', 'Mar'],
  ['April', 'Apr'],
  ['May', 'May'],
  ['June', 'Jun'],
  ['July', 'Jul'],
  ['August', 'Aug'],
  ['September', 'Sep'],
  ['October', 'Oct'],
  ['November', 'Nov'],
  ['December', 'Dec']
];
```

### `style`
This prop allows you to style the div which wraps the Datepicker component.  This can be useful, for instance, if you'd like to do something like make the component full-width or `display: block;` (by default the element is `inline-block`).  If you would like to style the button that triggers the opening of the datepicker we recommend you pass a custom element (button/link/etc) to the component via its default slot.

### Kitchen Sink Example:
```html
<script>
  const daysOfWeek = [
    [ 'Domingo', 'Dom' ],
    [ 'Lunes', 'Lun' ],
    [ 'Martes', 'Mar' ],
    [ 'Miércoles', 'Mié' ],
    [ 'Jueves', 'Jue' ],
    [ 'Viernes', 'Vie' ],
    [ 'Sábado', 'Sáb' ],
  ];
  const monthsOfYear = [
    [ 'Enero', 'Ene' ],
    [ 'Febrero', 'Feb' ],
    [ 'Marzo', 'Mar' ],
    [ 'Abril', 'Abr' ],
    [ 'Mayo', 'May' ],
    [ 'Junio', 'Jun' ],
    [ 'Julio', 'Jul' ],
    [ 'Agosto', 'Ago' ],
    [ 'Septiembre', 'Sep' ],
    [ 'Octubre', 'Oct' ],
    [ 'Noviembre', 'Nov' ],
    [ 'Diciembre', 'Dic' ],
  ];
</script>

<Datepicker
  bind:formattedSelected={selectedDateFormatted}
  bind:selected={selectedDate}
  bind:dateChosen={userHasChosenDate}
  start={threeDaysInPast}
  end={inThirtyDays}
  selectableCallback={filterWeekends}
  daysOfWeek={daysOfWeek}
  monthsOfYear={monthsOfYear}
  format={date => dayjs(date).format('DD/MM/YYYY')}
/>
```

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
