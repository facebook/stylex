# Vite + React Server Components + StyleX

This example layers
[`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc)
on top of React, while `@stylexjs/unplugin` compiles StyleX at build time. Each
RSC/SSR/client environment receives a single CSS asset with the aggregated
StyleX output appended.

### Prerequisites

- Node.js 18+
- Vite plus `@vitejs/plugin-rsc` and `@vitejs/plugin-react`
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Vite configuration (`vite.config.ts`)

```ts
import rsc from '@vitejs/plugin-rsc';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    rsc({
      /* RSC environment inputs configured below */
    }),
    react(),
    stylex.vite(),
  ],
  environments: {
    rsc: {
      build: {
        rollupOptions: { input: { index: './src/framework/entry.rsc.tsx' } },
      },
    },
    ssr: {
      build: {
        rollupOptions: { input: { index: './src/framework/entry.ssr.tsx' } },
      },
    },
    client: {
      build: {
        rollupOptions: {
          input: { index: './src/framework/entry.browser.tsx' },
        },
      },
    },
  },
});
```

- `stylex.vite()` automatically runs for each environment, so every output
  bundle gets the correct CSS appended.
- The example keeps the default plugin options, but you can pass `useCSSLayers`,
  custom import sources, etc. if needed.

## CSS entry point (`src/index.css`)

The framework root imports `src/index.css` so each RSC build emits a CSS asset.
During `npm run example:build`, the StyleX plugin appends the aggregated styles
from both client and server components to that file.

## Dev-only CSS/runtime injection

RSC environments own their HTML shell, so `src/root.tsx` injects the virtual
StyleX runtime and stylesheet while `import.meta.env.DEV` is true:

```tsx
{
  import.meta.env.DEV ? (
    <>
      <script type="module" src="/@id/virtual:stylex:runtime" />
      <link rel="stylesheet" href="/virtual:stylex.css" />
    </>
  ) : null;
}
```

Keep these tags (or equivalents) in place; without them the aggregated StyleX
CSS will not load in dev mode.

If a script tag is blocked, load the runtime from a client shim instead:

```ts
if (import.meta.env.DEV) import('virtual:stylex:runtime');
```

Keep the CSS `<link>` pointing at `/virtual:stylex.css` in the HTML head.

## Commands

```bash
# RSC-aware dev server with StyleX transforms
npm run example:dev

# Build all environments with aggregated StyleX CSS
npm run example:build

# Preview the production output
npm run example:serve
```

Run the scripts from `examples/example-vite-rsc`. The generated `dist/` folder
includes per-environment bundles whose CSS already contains the StyleX output.
