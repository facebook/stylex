# stylex &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebookexternal/stylex/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/stylex.svg?style=flat)](https://www.npmjs.com/package/@stylexjs/stylex) [![Build Status](https://github.com/facebookexternal/stylex/workflows/tests/badge.svg)](https://github.com/facebookexternal/stylex/actions) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/facebookexternal/styles/blob/master/.github/CONTRIBUTING.md)

stylex is a JavaScript library for writing conflict-free styles for user interfaces.


## Documentation

Documentation for individual packages can be found in their respective README files. Start with [`@stylexjs/stylex`](https://github.com/facebookexternal/stylex/blob/main/packages/stylex).

### Example

Here is a simple example of stylex use:

```js
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    padding: 10,
  },
  element: {
    backgroundColor: 'red',
  },
});

const styleProps = stylex.apply(styles.root, styles.element);
```


## Development

This is the development monorepo for stylex.

### Structure

* `.github`
  * Contains workflows used by GitHub Actions.
  * Contains issue templates and contribution guidelines.
* `apps`
  * Contains example apps using stylex and integration with build tools.
* `packages`
  * Contains the individual packages managed in the monorepo.
  * [babel-plugin](https://github.com/facebookexternal/stylex/blob/main/packages/babel-plugin)
  * [dev-runtime](https://github.com/facebookexternal/stylex/blob/main/packages/dev-runtime)
  * [eslint-plugin](https://github.com/facebookexternal/stylex/blob/main/packages/eslint-plugin)
  * [nextjs-plugin](https://github.com/facebookexternal/stylex/blob/main/packages/nextjs-plugin)
  * [rollup-plugin](https://github.com/facebookexternal/stylex/blob/main/packages/rollup-plugin)
  * [shared](https://github.com/facebookexternal/stylex/blob/main/packages/shared)
  * [stylex](https://github.com/facebookexternal/stylex/blob/main/packages/stylex)
  * [webpack-plugin](https://github.com/facebookexternal/stylex/blob/main/packages/webpack-plugin)

### Tasks

* `build`
  * Use `npm run build` to run the build script in every package.
  * Use `npm run build -w <package-name>` to run the build script for a specific package.
* `test`
  * Use `npm run test` to run tests for every package.
  * Use `npm run test -w <package-name>` to run the test script for a specific package.
More details can be found in the contributing guide below.


## Contributing

Development happens in the open on GitHub and we are grateful for contributions including bugfixes, improvements, and ideas.

### Code of Conduct

This project expects all participants to adhere to Meta's OSS [Code of Conduct]((https://opensource.fb.com/code-of-conduct/)). Please read the full text so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read the [contributing guide](https://github.com/facebookexternal/styles/blob/master/.github/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

### License

stylex is [MIT licensed](./LICENSE).
