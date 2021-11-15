# stylex &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebookexternal/stylex/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/stylex.svg?style=flat)](https://www.npmjs.com/package/stylex) [![Build Status](https://github.com/facebookexternal/stylex/workflows/tests/badge.svg)](https://github.com/facebookexternal/stylex/actions) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/facebookexternal/styles/blob/master/.github/CONTRIBUTING.md)

stylex is a JavaScript library for writing conflict-free styles for user interfaces.

## Documentation

The [documentation site](https://facebook.github.io/stylex/) covers installation, guides, and APIs.

## Examples

Here is a simple example to get you started:

```js
const styles = stylex.create({
  root: {
    padding: 10
  },
  element: {
    backgroundColor: 'red'
  }
});

const styleProps = stylex(styles.root, styles.element);
```

## Contributing

The main purpose of this repository is to continue evolving React core, making it faster and easier to use. Development of React happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving React.

### [Code of Conduct](https://code.fb.com/codeofconduct)

Facebook has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://code.fb.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

### [Contributing Guide](https://github.com/facebookexternal/styles/blob/master/.github/CONTRIBUTING.md)

Read our [contributing guide](https://github.com/facebookexternal/styles/blob/master/.github/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

### Good First Issues

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/facebookexternal/stylex/labels/good%20first%20issue) that contain bugs which have a relatively limited scope. This is a great place to get started.

### License

stylex is [MIT licensed](./LICENSE).
