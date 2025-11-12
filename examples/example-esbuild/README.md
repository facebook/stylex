# StyleX with esbuild

This example bundles a React app with esbuild while compiling StyleX via
`@stylexjs/unplugin`. The plugin extracts StyleX styles at build time,
aggregates them, and appends the result to an existing CSS file produced by
esbuild.

### Prerequisites

- Node.js 18+
- [`esbuild`](https://esbuild.github.io/) (installed locally)
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Build script (`scripts/build.mjs`)

The build script wires the unplugin into esbuild:

```js
import stylex from '@stylexjs/unplugin';

esbuild.build({
  entryPoints: ['src/App.jsx'],
  bundle: true,
  metafile: true,
  plugins: [
    stylex.esbuild({
      useCSSLayers: true,
      importSources: ['@stylexjs/stylex'],
      unstable_moduleResolution: { type: 'commonJS' },
    }),
  ],
});
```

- `metafile: true` lets the plugin locate CSS assets emitted by esbuild.
- `useCSSLayers: true` ensures the generated StyleX output is wrapped in CSS
  `@layer` declarations which enforces specificity. StyleX will use a polyfill
  based on ID selectors if omitted.

## CSS entry point (`src/global.css`)

The project imports `src/global.css` so esbuild emits a CSS asset. The StyleX
plugin appends the aggregated styles to that file during
`npm run example:build`.

## Commands

```bash
# Production bundle + CSS extraction
npm run example:build
```

Use `npm run example:build` whenever you need a fresh `public/dist` folder
containing both the JS bundle and the StyleX-enriched CSS.
