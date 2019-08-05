module.exports = {
    env: {
        browser: true,
        es6: true
    },
    // extends: 'eslint:recommended',
    extends: 'airbnb-base/legacy',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: [
        'svelte3'
    ],
    overrides: [
        {
            files: ['src/**/*.svelte'],
            processor: 'svelte3/svelte3'
        }
    ],
    rules: {

    }
};