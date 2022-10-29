---
sidebar_position: 1
---

# Installation

To start playing with StyleX without having to set up any build settings you can install just two packages:

```sh
$ npm install --save @stylexjs/stylex
$ npm install --save-dev @stylexjs/dev-runtime
```

Further, it's useful to have the ESlint plugin to catch common errors:

```sh
$ npm install --save-dev @stylexjs/eslint-plugin
```

In order to make it easy to get started, you can simply import `@stylexjs/development-runtime` in your JS entry-point to set everything up. [pending edit](noteplan://x-callback-url/openNote?noteTitle=Edits%20for%20Documentation%20to%20make%20sense%23Complete%20implementation%20of%20%60development-runtime%60)

```ts
import inject from '@stylexjs/development-runtime';

inject({
  // configuration options
  dev: true,
  test: false,
  classNamePrefix: 'x-',
  definedStylexCSSVariables: {
    primary: {
      lightMode: 'black',
      darkMode: 'white',
    },
  },
});
```

Once this is done, you can start importing and using `@stylexjs/stylex` without any further setup until you're ready to deploy to production.

# Building for Production

When you're ready to use StyleX in production, you will need to set up a build configuration to generate a static stylesheet at compile time and remove the runtime cost of injecting styles that is a common pitfall of many other CSS-in-JS libraries.

StyleX provides a Babel plugin along with plugins for Webpack, Rollup and NextJS.

Assuming you're using Webpack, you will need these additional packages:

```sh
$ npm install --save-dev @stylexjs/babel-plugin @stylexjs/webpack-plugin
```
