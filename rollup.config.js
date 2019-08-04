import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import browsersync from "rollup-plugin-browsersync";
import buble from "rollup-plugin-buble";

const production = !process.env.ROLLUP_WATCH;

const bundle = {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "SvelteCalendar",
    file: "docs/bundle.js"
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("docs/bundle.css");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),
    buble({ 
      objectAssign: true, 
      transforms: { asyncAwait: false }
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    terser()
  ]
};

const test = {
  input: "src/test.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "docs/test.js"
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("docs/test.css");
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),
    buble({ objectAssign: true, transforms: { asyncAwait: false } }),

    !production && browsersync({ server: "docs" }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    // production && terser()
    terser()
  ]
};

export default [bundle, test];
