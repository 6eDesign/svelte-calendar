# svelte-calendar
A small date picker built with Svelte.  Demo available here: [svelte-calendar](https://6edesign.github.io/svelte-calendar/)

# Basic usage (svelte v3):
```html
<Datepicker
  format="{dateFormat}"
  start={threeDaysInPast}
  end={inThirtyDays}
  selectableCallback={noWeekendsSelectableCallback}
/>
```
`start` & `end` are Date objects.

`format` Date formatting uses [timeUtils](https://github.com/6eDesign/timeUtils) formatting.

`selectableCallback` should be a function that accepts a single date as an argument and return true (if selectable) or false (if unavailable).

## Developing/Modifying Svelte-Calendar Guide:
*Note that you will need to have [Node.js](https://nodejs.org) installed.*

Install the dependencies...

```bash
cd svelte-calendar
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and your browser will reload the page so you can see your changes automatically.
