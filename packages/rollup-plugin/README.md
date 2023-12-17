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