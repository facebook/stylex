# @stylexjs/devtools-extension

Chrome DevTools extension for debugging StyleX in development.

## Develop / Build

Source lives in `src/` (React + StyleX). The loadable Chrome extension is the
build output in `extension/`.

```sh
npm run build -w @stylexjs/devtools-extension
```

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `packages/@stylexjs/devtools-extension/extension`

## Use

1. Open DevTools → **Elements**
2. Select an element that has `data-style-src`
3. Open the **StyleX** tab in the Elements sidebar

For best results, enable StyleX dev mode so the DOM includes `data-style-src`
and dev marker classNames:

```js
// @stylexjs/babel-plugin
{
  dev: true,
}
```
