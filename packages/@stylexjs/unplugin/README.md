# @stylexjs/unplugin

Universal bundler plugin for StyleX built on top of `unplugin`. It compiles StyleX at build time, aggregates CSS from all transformed modules, and appends the result into an existing CSS asset produced by your bundler (or emits a stable fallback when none exists).

- Adapters for Vite/Rollup, Webpack/Rspack, and esbuild.
- Designed to keep StyleX output consolidated and deterministic.
- Dev helpers expose virtual modules for hot CSS reloads: `virtual:stylex:runtime` (JS) and `/virtual:stylex.css` (CSS) or `virtual:stylex:css-only` (JS shim).

## Install

```
npm i -D @stylexjs/unplugin
```

## Usage by bundler

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    // devMode: 'full' | 'css-only' | 'off'
    // externalPackages: ['lib-using-stylex'] // optional manual include
    stylex.vite(),
    react(),
  ],
});
```

Notes:
- The plugin auto-discovers installed packages that depend on `@stylexjs/stylex` (or any configured `importSources`) and excludes them from `optimizeDeps`/`ssr.optimizeDeps` so their StyleX code is transformed. Use `externalPackages` to force-deopt additional deps.
- `devMode: 'full'` injects a lightweight runtime that refetches the dev CSS endpoint on HMR. `css-only` serves just the CSS endpoint. `off` disables dev middleware/virtual modules.
- In dev, inject the virtual CSS + runtime from your HTML shell. If a `<script src="/@id/virtual:stylex:runtime">` tag is blocked by CORS (some frameworks proxy assets differently), call `import('virtual:stylex:runtime')` or `import('virtual:stylex:css-only')` from a tiny client shim instead.
- Ensure your app produces a CSS asset (default Vite behavior). If none exists, the plugin writes `stylex.css` in the output.

Dev HTML injection (baseline):

```html
<!-- Add in your HTML shell when import.meta.env.DEV -->
<link rel="stylesheet" href="/virtual:stylex.css" />
<script type="module">
  import('virtual:stylex:runtime'); // or 'virtual:stylex:css-only' if you only need CSS
</script>
```

If your environment can safely load the runtime via a virtual module ID, replace
the inline script with `<script type="module" src="/@id/virtual:stylex:runtime">`.

### Rollup

```js
// rollup.config.mjs
import stylex from '@stylexjs/unplugin';

export default {
  plugins: [stylex.rollup()],
};
```

### Webpack

```js
// webpack.config.js
const stylex = require('@stylexjs/unplugin').default;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      // your JS/TS loader here
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
    ],
  },
  plugins: [stylex.webpack({ useCSSLayers: true }), new MiniCssExtractPlugin()],
};
```

### Rspack

```js
const rspack = require('@rspack/core');
const stylex = require('@stylexjs/unplugin').default;

module.exports = {
  plugins: [
    stylex.rspack(),
    new rspack.CssExtractRspackPlugin({ filename: 'index.css' }),
  ],
};
```

### esbuild

```js
import esbuild from 'esbuild';
import stylex from '@stylexjs/unplugin';

esbuild.build({
  entryPoints: ['src/App.jsx'],
  bundle: true,
  metafile: true, // lets the plugin locate CSS outputs if any
  plugins: [
    stylex.esbuild({
      importSources: ['@stylexjs/stylex'],
      useCSSLayers: true,
    }),
  ],
});
```

## Options (shared)

- `dev`: boolean, defaults based on `NODE_ENV`/`BABEL_ENV`.
- `importSources`: array of import sources to scan, default `['stylex', '@stylexjs/stylex']`.
- `useCSSLayers`: boolean, emit CSS layers.
- `babelConfig`: `{ plugins, presets }` to merge into the internal Babel call.
- `unstable_moduleResolution`: forwarded to the StyleX Babel plugin.
- `lightningcssOptions`: pass-through options for `lightningcss`.
- `cssInjectionTarget`: `(fileName: string) => boolean` to pick a CSS asset to append to. Defaults to `index.css`, `style.css`, or the first `.css` asset.
- `externalPackages`: package names inside `node_modules` that should be treated like app code (useful if they ship StyleX). They are excluded from Vite dependency optimization.
- `devMode`: `'full' | 'css-only' | 'off'` (Vite only).
- `devPersistToDisk`: persist collected rules to `node_modules/.stylex/rules.json` in dev so multiple Vite environments can share CSS.

## Notes

- With multiple outputs (e.g. client/SSR), each output gets its own aggregated StyleX CSS.
- If the bundler produces no CSS assets, the plugin emits a fallback `stylex.css` (often in `assets/` for Rollup/Vite or alongside esbuild outputs).
- When using extraction plugins (Webpack/Rspack), ensure they run so there is a CSS asset to append to; otherwise the fallback file is created.
- Dev HMR CSS hookup: add `<link rel="stylesheet" href="/virtual:stylex.css" />` to your shell in dev. For the JS runtime, prefer `import('virtual:stylex:runtime')` (or `virtual:stylex:css-only` if you only need CSS) from a local client shim when direct `<script src="/@id/virtual:stylex:runtime">` fails due to CORS/proxying.
