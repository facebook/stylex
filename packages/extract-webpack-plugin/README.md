# @stylexjs/extract-webpack-plugin


## Documentation Website
[https://stylexjs.com](https://stylexjs.com)

## Installation

Install the package by using:
```bash
npm install --save-dev @stylexjs/extract-webpack-plugin
```

or with yarn:

```bash
yarn add --dev @stylexjs/extract-webpack-plugin
```

Add the following to your `webpack.config.js`
```javascript
const StylexPlugin = require('@stylexjs/extract-webpack-plugin');
const path = require('path');

const config = (env, argv) => ({
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, '.build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    // Ensure that the stylex plugin is used before Babel
    new StylexPlugin({
      filename: '[name].[contenthash].css',
      // get webpack mode and set value for dev
      dev: argv.mode === 'development',
      // Use statically generated CSS files and not runtime injected CSS.
      // Even in development.
      runtimeInjection: false,
      // optional. default: 'x'
      classNamePrefix: 'x',
      // Required for CSS variable support
      unstable_moduleResolution: {
        // type: 'commonJS' | 'haste'
        // default: 'commonJS'
        type: 'commonJS',
        // The absolute path to the root directory of your project
        rootDir: __dirname,
      },
    }),
  ],
  cache: true,
});

module.exports = config;
```
