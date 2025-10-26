# example-vite

StyleX with Vite using `@stylexjs/unplugin`.

Scripts
- `npm run dev`: start Vite dev server.
- `npm run build`: build to `dist/` with a single StyleX CSS appended into extracted CSS assets.
- `npm run preview`: serve the production build.

Notes
- The example imports `src/index.css` so Vite produces at least one CSS asset at build time; the StyleX plugin appends the aggregated CSS into that asset.
- Plugin is used via `stylex.vite()` in `vite.config.mjs`.

