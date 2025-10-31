# @stylexjs/unplugin

Universal bundler plugin for StyleX built on top of unplugin. It compiles StyleX at build time, aggregates CSS from all transformed modules, and appends the result into an existing CSS asset produced by your bundler.

- Works with Vite/Rollup and Webpack/Rspack via unplugin.
- Ensures a single CSS output for StyleX by injecting into one existing CSS file.

## Install

```
npm i -D @stylexjs/unplugin
```

## Usage

Vite:

```js
// vite.config.ts
import { defineConfig } from 'vite'
import stylex from '@stylexjs/unplugin'

export default defineConfig({
  plugins: [stylex()]
})
```

Rollup:

```js
// rollup.config.mjs
import stylex from '@stylexjs/unplugin'

export default {
  // ...
  plugins: [stylex()],
}
```

Webpack:

```js
// webpack.config.js
const stylex = require('@stylexjs/unplugin').default

module.exports = {
  // ...
  plugins: [stylex()],
}
```

## Options

- `dev`: boolean, defaults based on `NODE_ENV`.
- `importSources`: array of import sources to scan, default `['stylex', '@stylexjs/stylex']`.
- `useCSSLayers`: boolean, emit CSS layers.
- `babelConfig`: `{ plugins, presets }` to merge.
- `unstable_moduleResolution`: forward to StyleX Babel plugin.
- `lightningcssOptions`: pass-through options for lightningcss.
- `cssInjectionTarget`: optional `(fileName: string) => boolean` to pick a CSS asset to append to. If not provided, the plugin picks `index.css`, `style.css`, or the first `.css` asset.

## Notes

- The plugin always aggregates all StyleX CSS across modules in a compilation and injects it into one CSS asset. With multiple outputs (e.g. client/SSR), each output will get its own aggregated CSS.
- If the bundler does not produce any CSS assets, the plugin logs a warning and skips injection.

