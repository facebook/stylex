# @stylexjs/nextjs-plugin

## Documentation Website
[https://stylexjs.com](https://stylexjs.com)

## Installation

Install the package by using:
```bash
npm install --save-dev @stylexjs/nextjs-plugin
```

or with yarn:

```bash
yarn add --dev @stylexjs/nextjs-plugin
```

Add the following to your `.babelrc.js`
```javascript
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        genConditionalClasses: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
```

Add the following to your `next.config.js`
```javascript
const stylexPlugin = require('@stylexjs/nextjs-plugin');

module.exports = stylexPlugin({
  rootDir: __dirname,
})({});
```