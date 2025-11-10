# RedwoodSDK + StyleX

This starter shows how RedwoodSDK’s Vite-based toolchain works with `@stylexjs/unplugin`. StyleX is compiled during dev and build, and the resulting CSS is appended to the worker/client assets that Redwood emits.

### Prerequisites
- Node.js 18+
- RedwoodSDK CLI (`rw-scripts`) plus `@cloudflare/vite-plugin`
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Vite configuration (`vite.config.mts`)

```ts
import { defineConfig } from 'vite';
import { redwood } from 'rwsdk/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'worker' } }),
    redwood(),
    stylex.vite({
      devMode: 'css-only',
      devPersistToDisk: true,
      dev: true,
      runtimeInjection: false,
    }),
  ],
});
```

- `devMode: 'css-only'` exposes only the CSS endpoint during dev (Redwood handles HTML/JS injection).
- `devPersistToDisk` makes the aggregated rules available across multiple Vite environments (worker + client).

## CSS entry point (`src/app/root.css`)

`src/app/root.css` is imported by the app shell so Vite/Workers always emit a CSS asset. The StyleX plugin appends its generated CSS to that file, keeping your own `@layer` directives intact.

## Commands

```bash
# Run the Redwood dev server (client + worker) with live StyleX transforms
npm run example:dev

# Production build (client bundle + worker assets)
npm run example:build

# Preview the production build locally
npm run example:serve

# Additional Redwood helpers
npm run dev:init
npm run worker:run
npm run release   # builds via npm run example:build before deploying
```

Execute these scripts inside `examples/example-redwoodsdk`. The generated `dist/` output already contains the aggregated StyleX CSS.
