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

## Dev-only CSS injection & HMR

Because Waku owns the root HTML shell, the layout mounts a tiny client component
that adds the dev stylesheet link _and_ triggers a JS import so Vite registers
StyleX for HMR:

```tsx
// src/components/DevStyleXInject.tsx
function DevStyleXInjectImpl() {
  useEffect(() => {
    import('virtual:stylex:css-only');
  }, []);
  return <link rel="stylesheet" href="/virtual:stylex.css" />;
}

export const DevStyleXInject = import.meta.env.DEV
  ? DevStyleXInjectImpl
  : () => null;
```

Add `<DevStyleXInject />` near the top of `src/pages/_layout.tsx`. The `link`
ensures the aggregated StyleX CSS loads in dev, and the `useEffect` import
keeps CSS hot reload working even though the root HTML is owned by Waku instead
of Vite.

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
