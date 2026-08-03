# @stylexjs/devtools-extension

DevTools extension for inspecting StyleX styles in Chrome and Firefox.

## Build

```sh
npm run build -w @stylexjs/devtools-extension
```

The build produces clean browser-specific directories with identical shared
application assets:

- `dist/chrome`
- `dist/firefox`

The extension currently uses `@stylexjs/stylex@0.19.0`, the latest published
StyleX release.

## Load In Chrome

1. Open `chrome://extensions` in Chrome 148 or newer.
2. Enable **Developer mode** and click **Load unpacked**.
3. Select `packages/@stylexjs/devtools-extension/dist/chrome`.

## Load In Firefox

1. Open `about:debugging#/runtime/this-firefox` in Firefox 153 or newer.
2. Click **Load Temporary Add-on**.
3. Select `packages/@stylexjs/devtools-extension/dist/firefox/manifest.json`.

Firefox does not expose the Chrome resource APIs used for source previews and
opening files. The Firefox build shows source metadata and provides a copy
location command instead.

## Verify And Package

```sh
npm test -w @stylexjs/devtools-extension
npm run verify:build -w @stylexjs/devtools-extension
npm run web-ext:lint -w @stylexjs/devtools-extension
npm run web-ext:build -w @stylexjs/devtools-extension
```

Packaging validates an explicit file allowlist before writing deterministic
store archives to `artifacts/chrome` and `artifacts/firefox`.

Firefox lint also verifies that the only accepted warnings are React DOM's two
generated compatibility assignments; any extension-owned or new warning fails
the check.
