# svelte-calendar

A small date picker built with Svelte 3. Demo available here: [view docs and examples](https://6edesign.github.io/svelte-calendar).

![Demo](static/demo.gif)

## Installation

```sh
npm i -D svelte-calendar
```

## Usage within svelte-kit project

When using this component within a svelte-kit application it is necessary to add its two dependencies (`just-throttle` and `dayjs`) to the `config.kit.vite.optimizeDeps.include` array in `svelte.config.js`. Eg: your config should include the following:

```js
const config = {
	kit: {
		vite: {
			optimizeDeps: {
				include: ['just-throttle', 'dayjs']
			}
		}
	}
};

export default config;
```

## Features

- Day, Month & Year pickers
- Responsive
- Keyboard, touch, and scroll support
- Inline & Picker modes
- Virtual/infinite grid for animation performance
- Store-driven and extensible
- [Localization](https://6edesign.github.io/svelte-calendar) using `day.js`
- Svelte-Kit support

## Features In Development

- time picker
- date & date-time range picker
