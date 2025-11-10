# React + Vite + StyleX

This example is a TypeScript-ready React project that runs on Vite while compiling StyleX through `@stylexjs/unplugin`. The plugin extracts StyleX styles at build time and appends them to the CSS emitted by Vite, so the browser only downloads a single stylesheet.

### Prerequisites
- Node.js 18+
- [`vite`](https://vite.dev/) with `@vitejs/plugin-react`
- `typescript` and `tsc -b` for type-checking the build
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Vite configuration (`vite.config.ts`)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [stylex.vite(), react()],
});
```

- `stylex.vite()` runs before the React plugin to keep Fast Refresh intact.
- The TypeScript-aware ESLint + compiler setup already points to the correct `tsconfigRootDir`, so no extra configuration is required.

## CSS entry point (`src/index.css`)

The root component imports `src/index.css`, ensuring that Vite emits a CSS file in both dev and build. During `npm run example:build`, the StyleX plugin appends its aggregated output to that asset (defaulting to `style.css`/`index.css`).

## Commands

```bash
# HMR-ready dev server with StyleX transforms
npm run example:dev

# Type-check + Vite build + StyleX CSS aggregation
npm run example:build

# Preview the production build
npm run example:serve
```

Use `npm run lint` for ESLint checks (StyleX lint rules are included). Run all commands from `examples/example-vite-react`.
