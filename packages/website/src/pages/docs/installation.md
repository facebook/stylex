---
title: Installation & Setup
date: Last Modified
permalink: /docs/installation/index.html
eleventyNavigation:
  key: Installation & Setup
  order: 1
---

:::lead
An overview of how to install and use {{ site.name }}.
:::

## Installation

Install the stylex runtime.

```shell
npm install stylex
```

## Compiler setup

Component libraries and npm packages must be compiled using the [Babel](https://babeljs.io/) plugin.

```shell
npm install --save-dev @stylexjs/babel-plugin
```

```js
{
  "plugins": [
    ["@stylexjs/babel-plugin", { }]
  ]
}
```

## Bundler setup

When using a bundler plugin the above compilation setup is built-in, and further runtime optimization is provided by CSS file extraction.

### Rollup

```shell
npm install --save-dev rollup-plugin-stylex
```

```js
// TODO: rollup example
```

### Webpack

```shell
npm install --save-dev webpack-plugin-stylex
```

```js
// TODO: webpack example
```

### Next.js

```shell
npm install --save-dev next-plugin-stylex
```

```js
// TODO: next example
```
