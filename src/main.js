import { polyfill } from "es6-object-assign";
polyfill();
import App from "./App.html";

const app = new App({
  target: document.body,
  data: {
    // name: 'world'
  }
});

export default app;
