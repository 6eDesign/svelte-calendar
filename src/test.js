import { polyfill } from 'es6-object-assign';
polyfill();
import App from './App.svelte';

const app = new App({
  target: document.body,
  data: {}
});

export default app;
