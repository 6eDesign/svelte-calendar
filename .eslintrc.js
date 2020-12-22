module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  // extends: 'eslint:recommended',
  extends: 'airbnb-base/legacy',
  ignorePatterns: ['src/index.js'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['svelte3', 'jest'],
  overrides: [
    {
      files: ['src/**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  rules: {},
};
