# Webpack Example with StyleX

This example demonstrates how to configure StyleX with Webpack for a React
application using `@stylexjs/unplugin`. The unplugin compiles StyleX at build
time, aggregates the CSS, and appends it to a CSS asset emitted by Webpack.

### Prerequisites

Set up the following tooling:

- MiniCssExtractPlugin (or another CSS extractor) so Webpack produces a CSS
  asset for StyleX to append to.
- A CSS file that is imported for every route of your app which contains any
  global styles such as a CSS reset.

## Overview

This setup includes:

- **Webpack** for bundling plus **MiniCssExtractPlugin** for CSS extraction
- **@stylexjs/unplugin** for StyleX compilation + CSS aggregation
- **ESLint** for StyleX-specific linting rules

## Configuration Files

### 1. Package Dependencies (`package.json`)

```bash
# Install runtime StyleX package
npm install @stylexjs/stylex

# Install dev dependencies
npm install -D @stylexjs/unplugin @stylexjs/eslint-plugin
```

### 2. Babel Configuration (`.babelrc.js`)

Babel now only needs to handle React/ES features. StyleX compilation is handled
by the unplugin.

```javascript
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
};
```

### 3. Webpack Configuration (`webpack.config.js`)

Register `@stylexjs/unplugin` so it can transform StyleX imports and append CSS
to the extracted stylesheet.

```javascript
const fs = require('node:fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const stylex = require('@stylexjs/unplugin').default;
const templatePath = path.resolve(__dirname, 'index.html');

module.exports = {
  // ...
  devServer: {
    watchFiles: [templatePath, path.resolve(__dirname, 'src/**/*')],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      templateContent: () => fs.readFileSync(templatePath, 'utf-8'),
    }),
    stylex.webpack({
      // Recommended
      useCSSLayers: true,
    }),
    new MiniCssExtractPlugin(),
  ],
};
```

### 4. ESLint Configuration (`.eslintrc.js`)

StyleX-specific linting rules:

```javascript
module.exports = {
  plugins: ['@stylexjs'],
  rules: {
    '@stylexjs/valid-styles': 'error',
    '@stylexjs/no-unused': 'error',
    '@stylexjs/valid-shorthands': 'warn',
    '@stylexjs/sort-keys': 'warn',
  },
};
```

### 5. CSS entry point (`src/app.css`)

Ensure there is at least one CSS file bundled by Webpack so the unplugin has an
injection target. StyleX CSS will be appended to this file automatically, and
because the plugin is configured with `useCSSLayers: true`, the generated output
respects CSS layer ordering alongside your existing `@layer` blocks.

## Commands

```bash
# Development server
npm run example:dev

# Production build
npm run example:build

# Serve built files
npm run example:serve
```
