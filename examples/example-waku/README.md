# Waku + StyleX

This example shows how to integrate StyleX into a Waku application. The Vite
layer powering Waku runs `@stylexjs/unplugin`, which compiles StyleX modules,
aggregates the generated CSS, and appends it to the emitted CSS assets so the
browser only loads a single stylesheet.

### Prerequisites

- Node.js 18+
- [`waku`](https://waku.gg) CLI/runtime
- `@stylexjs/stylex` and `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Waku/Vite configuration (`waku.config.ts`)

```ts
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'waku/config';

export default defineConfig({
  vite: {
    plugins: [
      stylex.vite({
        useCSSLayers: true,
        devMode: 'css-only',
        devPersistToDisk: true,
        runtimeInjection: false,
      }),
      react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    ],
  },
});
```

- `devMode: 'css-only'` exposes the `/virtual:stylex.css` endpoint in dev.
- `devPersistToDisk` lets multiple Waku environments (client/server) share
  StyleX rules while developing.

## CSS entry point (`src/global.css`)

`src/global.css` keeps a minimal reset so Waku always emits at least one CSS
asset. The StyleX plugin appends its aggregated output to that file during
`npm run example:build`.

## Dev-only CSS injection

Because Waku owns the root HTML shell, the layout manually links to the StyleX
dev endpoint and loads a tiny helper that imports the virtual CSS module:

```tsx
{
  /* src/pages/_layout.tsx */
}
{
  import.meta.env.DEV ? (
    <>
      <link rel="stylesheet" href="/virtual:stylex.css" />
      <script type="module" src="/src/stylex-dev-client.ts" />
    </>
  ) : null;
}
```

`src/stylex-dev-client.ts` simply `import('virtual:stylex:css-only')` to listen
for `stylex:css-update` events and bust the stylesheet cache. Include these two
lines whenever you embed StyleX inside a custom HTML shell; otherwise, no CSS
appears in dev.

## Commands

```bash
# Start the Waku dev server with live StyleX transforms
npm run example:dev

# Production build (all Waku environments + aggregated StyleX CSS)
npm run example:build

# Preview the production build
npm run example:serve
```

Run the scripts from `examples/example-waku`. The generated `dist/` output
already contains the StyleX CSS bundled into the Waku client assets.
