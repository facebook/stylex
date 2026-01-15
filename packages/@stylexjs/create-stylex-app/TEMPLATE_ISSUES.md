# Template Issues Tracker

Tracking issues found when testing each template with `create-stylex-app`.

Will be deleted once ready to merge

## Summary

| Template     | Status                                 | Script               |
|--------------|----------------------------------------|----------------------|
| nextjs       | ❌ Missing `autoprefixer`              | `npm run dev`        |
| vite-react   | ✅ Fixed (shared-ui fetched)           | `npm run dev`        |
| vite         | ✅ Fixed (shared-ui fetched)           | `npm run dev`        |
| webpack      | ✅ Working                             | `npm run dev`        |
| rollup       | ❌ Missing `@babel/preset-flow`        | `npm run dev`        |
| esbuild      | ✅ Working                             | `npm run build` only |
| rspack       | ✅ Working                             | `npm run dev`        |
| react-router | ❌ vite-plugin-devtools-json conflict  | `npm run dev`        |
| waku         | ❌ SSR import issue with file: dep     | `npm run dev`        |
| vite-rsc     | ✅ Fixed (shared-ui fetched)           | `npm run dev`        |
| redwoodsdk   | ❌ React canary/stable version conflict | `npm run dev`        |
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

**Error when installing (without fix):**
```
npm error 404 Not Found - GET https://registry.npmjs.org/@stylexjs%2fshared-ui - Not found
```

**Fix Status:** ✅ **Fixed** - The CLI now:
1. Fetches `examples/shared-ui` from GitHub alongside the template (to `./shared-ui/`)
2. Rewrites `@stylexjs/shared-ui` dependency in package.json to `file:./shared-ui`
3. npm resolves the dependency from the local directory

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

**Status:** ✅ Fixed

The shared-ui dependency is now fetched from GitHub and installed as a local file dependency.

---

## vite

**Status:** ✅ Fixed

The shared-ui dependency is now fetched from GitHub and installed as a local file dependency.

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

**Status:** ❌ Failing

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer vite@"^2.7.0 || ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0" from vite-plugin-devtools-json@0.2.0
```

**Root Cause:**
The template has `vite@^7.2.4` but `vite-plugin-devtools-json@0.2.0` only supports up to Vite 6.

**Fix Required:**
Either update `vite-plugin-devtools-json` to a version that supports Vite 7, or downgrade Vite to v6.

**Note:** The shared-ui fetching works correctly for this template.

---

## waku

**Status:** ❌ Failing (RSC compatibility issue)

**Error:**
```
[SSR Error]
Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.
```

**Root Cause:**
Waku uses React Server Components (RSC) and cannot properly resolve exports from `file:` dependencies that contain raw TypeScript files. The `Button` component from `@stylexjs/shared-ui` is imported as `undefined` during SSR.

**Technical Details:**
- The CLI correctly fetches shared-ui from GitHub
- npm installs it as a symlink (`node_modules/@stylexjs/shared-ui -> ../../shared-ui`)
- However, Waku/Vite's RSC bundler doesn't process the raw `.tsx` files from the package
- Attempted fixes that didn't work:
  - Adding `ssr.noExternal: ['@stylexjs/shared-ui']` to waku.config.ts
  - Adding `'use client'` directive to the Button component
  - Converting symlink to a hard copy
  - Adding `optimizeDeps.include` configuration

**Why it works in the monorepo:**
In the monorepo, yarn workspaces hoists all packages to the root `node_modules`, and Vite already knows to process source files from workspace packages. When using the CLI with `file:` dependencies, the package ends up in a different location that Waku's bundler doesn't handle the same way.

**Potential Solutions:**
1. **Inline shared-ui** (most reliable): Copy the Button component directly into example-waku/src/ instead of using it as a dependency
2. **Remove shared-ui usage**: Simplify the example to not use shared-ui
3. **Build shared-ui**: Pre-compile shared-ui to JavaScript and export built files instead of raw TypeScript (but this breaks the monorepo workflow)
4. **Wait for Waku/Vite fix**: This may be a broader issue with how Waku handles local TypeScript dependencies

**Recommendation:** Since this is a Waku-specific limitation and the template works fine in the monorepo, this can remain a known issue. Users scaffolding with the CLI can manually fix by copying the Button component or removing it.

---

## vite-rsc

**Status:** ✅ Fixed

The shared-ui dependency is now fetched from GitHub and installed as a local file dependency.

---

## redwoodsdk

**Status:** ❌ Failing

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: react@19.3.0-canary-561ee24d-20251101
npm error Could not resolve dependency:
npm error peer react@"^19.2.1" from react-server-dom-webpack@19.2.1
```

**Root Cause:**
The template uses a React canary version (`19.3.0-canary-561ee24d-20251101`) but `react-server-dom-webpack@19.2.1` requires stable React (`^19.2.1`). npm's semver resolution treats canary versions differently and doesn't satisfy the peer dependency.

**Note:** The shared-ui fetching works correctly for this template.

**Fix Required:**
Update `examples/example-redwoodsdk/package.json` to use compatible versions. Either:
1. Downgrade React to stable: `"react": "^19.2.1"`, `"react-dom": "^19.2.1"`
2. Or upgrade `react-server-dom-webpack` to a matching canary version

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
