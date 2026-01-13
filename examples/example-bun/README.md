# StyleX with Bun

This example bundles a React app with Bun while compiling StyleX via
`@stylexjs/unplugin`. The unplugin uses its esbuild adapter (Bun’s plugin API is
esbuild-compatible) to compile StyleX at build time, aggregate the generated
styles, and append them to the CSS asset emitted from `src/global.css`.

### Prerequisites

- Bun 1.1+
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Build script (`scripts/build.mjs`)

The production build script wires the unplugin into `Bun.build`:

```js
import stylex from '@stylexjs/unplugin';

await Bun.build({
  entrypoints: ['src/main.jsx'],
  outdir: 'dist',
  metafile: true,
  plugins: [
    stylex.esbuild({
      useCSSLayers: true,
      importSources: ['@stylexjs/stylex'],
    }),
  ],
});
```

- `metafile: true` lets the plugin locate CSS assets emitted by Bun.
- `useCSSLayers: true` wraps StyleX output in `@layer` declarations for
  predictable specificity.

## CSS entry points

- Production uses `src/global.css` so Bun emits a CSS asset; StyleX appends
  aggregated styles during `npm run example:build`.
- Development writes `dist/stylex.dev.css`, which the Bun plugin rewrites on
  every StyleX transform so the dev server can hot-reload CSS.

## Dev server integration

The Bun dev server uses `bunfig.toml` with `@stylexjs/unplugin/bun`, which
writes generated StyleX rules into `dist/stylex.dev.css` (marked with
`--stylex-injection`).

`dist/` is generated output and should remain gitignored.

## Commands

```bash
# Production bundle + StyleX CSS extraction
npm run example:build

# Bun dev server with HMR at http://localhost:3000
npm run example:dev

# Serve the generated bundle (run example:build first)
npm run example:start
```

The dev server uses Bun's fullstack mode, bundling `dist/index.dev.html` on
request with `development: true` and the StyleX Bun plugin. Production builds
write `dist/index.html` alongside the bundled assets.
