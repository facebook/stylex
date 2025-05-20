# @stylexjs/rollup-plugin

## Documentation Website
[https://stylexjs.com](https://stylexjs.com)

## Installation

Install the package by using:
```bash
npm install --save-dev @stylexjs/rollup-plugin
```

or with yarn:

```
yarn add --dev @stylexjs/rollup-plugin
```

Add the following to you `rollup.config.mjs`
```javascript
import stylexPlugin from '@stylexjs/rollup-plugin';

const config = {
  input: './index.js',
  output: {
    file: './.build/bundle.js',
    format: 'es',
  },
  plugins: [stylexPlugin({ fileName: 'stylex.css' })],
};

export default config;
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
useCSSLayers: 'none' | 'native' | 'polyfill' // Default: 'none'
```

The `useCSSLayers` option controls how StyleX handles CSS specificity and layer
management. It supports three strategies:

- `'none'` (default): Uses `:not(#\#)` to handle CSS specificity without layers
- `'native'`: Uses native CSS `@layer` for handling CSS specificity
- `'polyfill'`: Uses `@csstools/postcss-cascade-layers` to polyfill CSS layers
  for browsers that don't support them

---
### babelConfig
```js
babelConfig: {
  plugins: PluginItem[],
  presets: PluginItem[]
} // Default: { plugins: [], presets: [] }
```
List of custom babel plugins and presets which can be used during code transformation.