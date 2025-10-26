# example-rspack

StyleX with Rspack using `@stylexjs/unplugin`.

Scripts
- `npm run dev`: starts Rspack dev server and opens the app.
- `npm run build`: builds into `dist/` with a single `index.css` that includes StyleX CSS.

Notes
- The example imports `src/global.css` to ensure a CSS asset exists; the StyleX plugin appends aggregated CSS to that extracted file (preferably `index.css`).
- Plugin used in `rspack.config.js` via `require('@stylexjs/unplugin').default()`.

