---
title: Using stylex with Next.js
date: Last Modified
permalink: /docs/using-stylex-with-nextjs.html
eleventyNavigation:
  key: Next.js
  order: 0
---

{% import "fragments/macros.html" as macro with context %}

:::lead
Using stylex with Next.js
:::

This tutorial will teach you how to use stylex on Next.js.

!! Note this tutorial does not cover using stylex with SWC, so if your next.config.js has `swcMinify` set to true, this currently will not work.

### Install the packages

The first step in enabling stylex on Next.js is installing the required packages.

Navigate to your next.js project folder and run the following command. You can also use your package manager of choice to do it, just don't forget to install all 3 packages.

`$ npm install @stylexjs/stylex @stylexjs/nextjs-plugin @stylexjs/babel-plugin @stylexjs/eslint-plugin`

### Enable stylex babel transform

Create or edit the `.babelrc` in the root of your project directory and add `@stylexjs/babel-plugin` to the plugins array.

If you just created your plugin, your `.babelrc` will look something like this:

```
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "@stylexjs/babel-plugin",
      {}
    ]
  ]
}
```

### Enable stylex for webpack

Open up the `next.config.js` at the root of your directory and use the stylex nextjs configuration injector to enable the webpack config.

If you haven't modified your `next.config.js` you will need to disable swc and your config will look something like this.

```
/** @type {import('next').NextConfig} */
const withStylex = require("nextjs-plugin-stylex");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
};

const stylexConfig = {}; // for future configuration options

module.exports = withStylex(stylexConfig)(nextConfig);
```

### (Re)Start your dev server

Now that you've enabled stylex, you will need to start your dev server from scratch to pick up the changes.
