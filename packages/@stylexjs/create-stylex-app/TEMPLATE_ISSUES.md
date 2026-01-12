# Template Issues Tracker

Tracking issues found when testing each template with `create-stylex-app`.

Will be deleted once ready to merge

## Summary

| Template     | Status                                 | Script               |
|--------------|----------------------------------------|----------------------|
| nextjs       | ❌ Missing `autoprefixer`              | `npm run dev`        |
| vite-react   | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| vite         | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| webpack      | ✅ Working                             | `npm run dev`        |
| rollup       | ❌ Missing `@babel/preset-flow`        | `npm run dev`        |
| esbuild      | ✅ Working                             | `npm run build` only |
| rspack       | ✅ Working                             | `npm run dev`        |
| react-router | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| waku         | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| vite-rsc     | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| redwoodsdk   | ⚠️ Needs testing (shared-ui inlined)  | `npm run dev`        |
| storybook    | ❌ vitest version conflict             | `npm run storybook`  |
| cli          | ✅ Working                             | `npm run build` only |

**Build-only templates (no dev server):**
- **esbuild** - Uses `npm run build`
- **cli** - Uses `npm run build`

**Special script:**
- **storybook** - Uses `npm run storybook`

---

## Templates using @stylexjs/shared-ui (6 total)

These templates depend on `@stylexjs/shared-ui` which is a private package not published to npm.

**Affected templates:**
1. example-react-router
2. example-redwoodsdk
3. example-vite-react
4. example-vite-rsc
5. example-vite
6. example-waku

**Error when installing:**
```
npm error 404 Not Found - GET https://registry.npmjs.org/@stylexjs%2fshared-ui - Not found
```

**Fix Status:** ⚠️ **Partially fixed locally** - shared-ui has been inlined into all 6 examples:
- Each example now has `src/shared-ui/tokens.stylex.ts` and `src/shared-ui/index.tsx` (or `.js`/`.jsx` for vite)
- Imports updated from `@stylexjs/shared-ui` → `./shared-ui`
- `@stylexjs/shared-ui` removed from package.json dependencies

**⚠️ Needs testing after branch merge** - these templates may have additional missing dependencies (similar to nextjs/autoprefixer or rollup/@babel/preset-flow issues).

---

## nextjs (Next.js App Router)

**Status:** ❌ Failing

**Error:**
```
✓ Starting...
✓ Ready in 1059ms
  Using external babel configuration from /private/tmp/test-nextjs/babel.config.js
⨯ ./app/app.css
Error evaluating Node.js code
Error: Cannot find module 'autoprefixer'
Require stack:
- /private/tmp/test-nextjs/.next/dev/build/chunks/[root-of-the-server]__6d51cb5d._.js
- /private/tmp/test-nextjs/.next/dev/build/chunks/[turbopack]_runtime.js
- /private/tmp/test-nextjs/.next/dev/build/postcss.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1410:15)]
    ...

Import trace:
  Client Component Browser:
    ./app/app.css [Client Component Browser]
    ./app/layout.tsx [Server Component]

 GET / 500 in 1916ms (compile: 1858ms, render: 58ms)
```

**Root Cause:**
The `postcss.config.js` requires `autoprefixer`, but it's not listed in `package.json` dependencies.

**Location:** `examples/example-nextjs/postcss.config.js`

**Fix Required:**
Add `autoprefixer` to devDependencies in `examples/example-nextjs/package.json`:
```json
"devDependencies": {
  "autoprefixer": "^10.4.20",
  ...
}
```

---

## vite-react

**Status:** ❌ Failing

**Error:**
```
(!) Failed to run dependency scan. Skipping dependency pre-bundling. Error: The following dependencies are imported but could not be resolved:

  @stylexjs/shared-ui (imported by /private/tmp/test-vite-react/src/App.tsx)
  @stylexjs/shared-ui/tokens.stylex (imported by /private/tmp/test-vite-react/src/App.tsx)

Are they installed?

10:29:47 PM [vite] Internal server error: /private/tmp/test-vite-react/src/App.tsx: Could not resolve the path to the imported file.
  10 | import * as stylex from '@stylexjs/stylex';
  11 | import { Button } from '@stylexjs/shared-ui';
> 12 | import { tokens } from '@stylexjs/shared-ui/tokens.stylex';
     |          ^^^^^^
```

**Root Cause:**
Uses `@stylexjs/shared-ui` which is a private package not published to npm (see shared-ui section above)

**Fix Status:** ⚠️ Partially fixed - shared-ui inlined into `examples/example-vite-react/src/shared-ui/`. Needs testing after merge for other potential missing dependencies.

---

## vite

**Status:** ⚠️ Needs testing (pending merge) - shared-ui inlined, may have other issues

---

## webpack

**Status:** ✅ Working

---

## rollup

**Status:** ❌ Failing

**Error:**
```
rollup v4.55.1
bundles ./src/index.js → .build/bundle.js...
[!] (plugin commonjs--resolver) Error: Cannot find package '@babel/preset-flow' imported from /private/tmp/test-rollup/babel-virtual-resolve-base.js
```

**Root Cause:**
The `babel.config.js` uses `@babel/preset-flow`, but it's not listed in `package.json` dependencies.

**Fix Required:**
Add `@babel/preset-flow` to devDependencies in `examples/example-rollup/package.json`:
```json
"devDependencies": {
  "@babel/preset-flow": "^7.27.1",
  ...
}
```

---

## esbuild

**Status:** ✅ Working

**Note:** No `dev` script - this is a build-only template. Run `npm run build` instead. The CLI correctly detects this and shows the right command in "Next steps".

---

## rspack

**Status:** ✅ Working

---

## react-router

**Status:** ⚠️ Needs testing (pending merge) - shared-ui inlined, may have other issues

---

## waku

**Status:** ⚠️ Needs testing (pending merge) - shared-ui inlined, may have other issues

---

## vite-rsc

**Status:** ⚠️ Needs testing (pending merge) - shared-ui inlined, may have other issues

---

## redwoodsdk

**Status:** ⚠️ Needs testing (pending merge) - shared-ui inlined, may have other issues

---

## storybook

**Status:** ❌ Failing

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: vitest@4.0.16
npm error Could not resolve dependency:
npm error peer vitest@"3.2.4" from @vitest/browser@3.2.4
```

**Root Cause:**
Version mismatch between `vitest@^4.0.13` and `@vitest/browser@^3.2.4`. The `@vitest/browser` package requires `vitest@3.2.4` as a peer dependency, but the template has `vitest@4.x`.

**Fix Required:**
Update `examples/example-storybook/package.json` to use compatible versions:
```json
"devDependencies": {
  "vitest": "^3.2.4",
  "@vitest/browser": "^3.2.4",
  ...
}
```
Or upgrade `@vitest/browser` to v4.x if available.

**Additional Issue:** No `dev` script - should use `npm run storybook` instead.

---

## cli

**Status:** ✅ Working

**Note:** This is a standalone CLI template for using StyleX without a bundler. It uses `@stylexjs/cli` to compile `.stylex.js` files directly. No `dev` script - run `npm run build` instead. The CLI correctly detects this and shows the right command in "Next steps".
