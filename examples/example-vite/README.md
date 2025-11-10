# Vite Example with StyleX

This project shows how to wire StyleX into a Vite + React application using `@stylexjs/unplugin`. The plugin compiles StyleX at build time, aggregates the generated CSS, and injects it into the CSS emitted by Vite.

### Prerequisites
- Node.js 18+
- [`vite`](https://vite.dev/) and `@vitejs/plugin-react`
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Vite configuration (`vite.config.mjs`)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [stylex.vite(), react()],
});
```

- `stylex.vite()` enables StyleX transforms for both dev and build.
- React Fast Refresh continues to work because the StyleX plugin runs before `@vitejs/plugin-react`.

## CSS entry point (`src/index.css`)

The app imports `src/index.css` so that Vite always emits a CSS asset. During `npm run example:build`, the StyleX plugin appends the aggregated styles to that file (defaulting to `style.css`/`index.css`).

## Commands

```bash
# Start the Vite dev server with StyleX transforms
npm run example:dev

# Production build with a single StyleX CSS injection
npm run example:build

# Preview the production build locally
npm run example:serve
```

Run these scripts from `examples/example-vite`. The output `dist/` folder contains both the JS bundle and the StyleX-enriched CSS.
