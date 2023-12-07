# StyleX &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/stylex/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@stylexjs/stylex.svg?style=flat)](https://www.npmjs.com/package/@stylexjs/stylex) [![Build Status](https://github.com/facebook/stylex/workflows/tests/badge.svg)](https://github.com/facebook/stylex/actions) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/facebook/stylex/blob/main/.github/CONTRIBUTING.md)

StyleX is a JavaScript library for defining styles for optimized user
interfaces.

## Documentation

[Documentation Website](https://stylexjs.com)

Documentation for individual packages can be found in their respective README
files. Start with
[`@stylexjs/stylex`](https://github.com/facebook/stylex/blob/main/packages/stylex).

### Example

Here is a simple example of StyleX use:

```js
import StyleX from '@stylexjs/stylex';

const styles = StyleX.create({
  root: {
    padding: 10,
  },
  element: {
    backgroundColor: 'red',
  },
});

const styleProps = StyleX.apply(styles.root, styles.element);
```

## Development

This is the development monorepo for StyleX.

### Structure

- `.github`
  - Contains workflows used by GitHub Actions.
  - Contains issue templates and contribution guidelines.
- `apps`
  - Contains example apps using StyleX and integration with build tools.
- `packages`
  - Contains the individual packages managed in the monorepo.
  - [babel-plugin](https://github.com/facebook/stylex/blob/main/packages/babel-plugin)
  - [dev-runtime](https://github.com/facebook/stylex/blob/main/packages/dev-runtime)
  - [eslint-plugin](https://github.com/facebook/stylex/blob/main/packages/eslint-plugin)
  - [nextjs-plugin](https://github.com/facebook/stylex/blob/main/packages/nextjs-plugin)
  - [open-props](https://github.com/facebook/stylex/blob/main/packages/open-props)
  - [rollup-plugin](https://github.com/facebook/stylex/blob/main/packages/rollup-plugin)
  - [shared](https://github.com/facebook/stylex/blob/main/packages/shared)
  - [StyleX](https://github.com/facebook/stylex/blob/main/packages/stylex)
  - [webpack-plugin](https://github.com/facebook/stylex/blob/main/packages/webpack-plugin)

### Tasks

First, `npm install` the npm workspace.

- `build`
  - Use `npm run build` to run the build script in every package.
  - Use `npm run build -w <package-name>` to run the build script for a specific
    package.
- `test`
  - Use `npm run test` to run tests for every package.
  - Use `npm run test -w <package-name>` to run the test script for a specific
    package. More details can be found in the contributing guide below.

## Contributing

Development happens in the open on GitHub and we are grateful for contributions
including bugfixes, improvements, and ideas.

### Code of Conduct

This project expects all participants to adhere to Meta's OSS
[Code of Conduct](https://opensource.fb.com/code-of-conduct/). Please read
the full text so that you can understand what actions will and will not be
tolerated.

### Contributing Guide

Read the
[contributing guide](https://github.com/facebook/stylex/blob/main/.github/CONTRIBUTING.md)
to learn about our development process, how to propose bugfixes and
improvements, and how to build and test your changes.

### Architectural Principles

Before proposing a change or addition to the StyleX API, you should familiarize
yourself with the
[goals and architectural principles](https://stylexjs.com/docs/learn/thinking-in-stylex/)
of the project.

### License

StyleX is [MIT licensed](./LICENSE).
