# React Router + RSC + StyleX

⚠️ **EXPERIMENTAL**: This template demonstrates React Server Components with React Router. It is intended for exploration only.

## Highlights

- 🧪 React Server Components powered by Vite’s RSC plugin
- 🧵 Styling via [`@stylexjs/stylex`](https://stylexjs.com/) compiled by [`@stylexjs/unplugin`](https://www.npmjs.com/package/@stylexjs/unplugin)
- 🧭 React Router 7 data APIs + server actions
- ⚡️ Instant HMR during `example:dev`
- 🔣 TypeScript out of the box

## Scripts

```bash
npm install                  # install dependencies
npm run example:dev          # start Vite dev server with RSC + StyleX
rm -rf dist && npm run example:build   # optional clean + production build
npm run example:start        # run the Express server using the dist/ output
npm run example:typecheck    # type-check without emitting files
```

Dev server runs on `http://localhost:5173` by default.

## StyleX integration

The Vite config registers the StyleX unplugin before the RSC plugin so that both client and server bundles share the same compiled CSS:

```ts
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    stylex.vite({ useCSSLayers: true }),
    react(),
    rsc({ /* ... */ }),
  ],
});
```

- `src/stylex.css` is imported from the root route. This ensures Vite always emits a CSS asset that the unplugin can append to.
- During development the layout injects the virtual StyleX runtime and stylesheet (`/@id/virtual:stylex:runtime` + `/virtual:stylex.css`) so HMR picks up CSS changes without reloading.
- `@stylexjs/stylex` is used throughout the client components (`routes/root/client.tsx`, `routes/home/route.tsx`, etc.) instead of Tailwind classes.

## React Server Components recap

Three entry points orchestrate the RSC flow:

- **`entry.rsc.tsx`** — React Server request handler
- **`entry.ssr.tsx`** — wraps the RSC payload in HTML for SSR
- **`entry.browser.tsx`** — hydrates the RSC payload on the client

Routes are defined in `src/routes/config.ts` using `unstable_RSCRouteConfig`, and shared layout/UI lives in `src/routes/root`.

---

Built with ❤️ using React Router + StyleX.
