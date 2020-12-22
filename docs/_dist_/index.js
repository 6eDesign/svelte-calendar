import __SNOWPACK_ENV__ from '../__snowpack__/env.js';
import.meta.env = __SNOWPACK_ENV__;

import App from './App.js';

var app = new App({
  target: document.body,
});

export default app;

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
