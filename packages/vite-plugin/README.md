# @stylexjs/vite-plugin

Use StyleX with _vite_ bundler.

This plugin transforms files that contain `stylexjs` imports and generates a
`stylexjs` `CSS` bundle.

## Installation

```
npm install --save-dev @stylexjs/vite-plugin
```

## Usage

```ts
import { defineConfig } from 'vite';
import stylexPlugin from '@stylexjs/vite-plugin';

export default defineConfig({
  plugins: [stylexPlugin()],
});
```

You can see the example usage
[here](https://github.com/facebook/stylex/apps/vite-example).
