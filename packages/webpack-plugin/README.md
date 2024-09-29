# @stylexjs/webpack-plugin


## Documentation Website
[https://stylexjs.com](https://stylexjs.com)

## Installation

Install the package by using:
```bash
npm install --save-dev @stylexjs/webpack-plugin
```

or with yarn:

```bash
yarn add --dev @stylexjs/webpack-plugin
```

Add the following to your `webpack.config.js`
```javascript
const StylexPlugin = require('@stylexjs/webpack-plugin');
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
      filename: 'styles.[contenthash].css',
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
## Plugin Options
It inherits all options from `@stylexjs/babel-plugin` and can be found [here 🔗](https://stylexjs.com/docs/api/configuration/babel-plugin/). Along with other options like <br/>

### fileName
```js
fileName: string // Default: 'stylex.css'
```
The name of the output css file.

---
### useCSSLayers
```js
useCSSLayers: boolean // Default: false
```
Enabling this option switches Stylex from using `:not(#\#)` to using `@layers` for handling CSS specificity.

---
### babelConfig
```js
babelConfig: {
  babelrc: boolean,
  plugins: PluginItem[],
  presets: PluginItem[]
} // Default: { babelrc: false, plugins: [], presets: [] }
```
List of custom babel plugins and presets which can be used during code transformation and whether to use the `.babelrc` file.
