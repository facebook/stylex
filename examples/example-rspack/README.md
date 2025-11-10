# Rspack Example with StyleX

This project demonstrates how to run StyleX inside Rspack via `@stylexjs/unplugin`. The plugin compiles StyleX at build time and appends the generated CSS to the stylesheet emitted by `CssExtractRspackPlugin`.

### Prerequisites
- Node.js 18+
- `@rspack/cli` / `@rspack/core`
- `MiniCssExtractRspackPlugin` (bundled with Rspack) or another CSS extractor
- `@stylexjs/unplugin`

## Install dependencies

```bash
npm install
```

## Rspack configuration (`rspack.config.js`)

```javascript
const path = require('path');
const rspack = require('@rspack/core');
const stylex = require('@stylexjs/unplugin').default;

module.exports = {
  entry: { app: path.resolve(__dirname, 'src/main.jsx') },
  plugins: [
    stylex.rspack({}),
    new rspack.CssExtractRspackPlugin({ filename: 'index.css' }),
  ],
  module: {
    rules: [
      { test: /\.[jt]sx?$/, loader: 'builtin:swc-loader' },
      { test: /\.css$/, use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'] },
    ],
  },
};
```

- `stylex.rspack()` injects the plugin into the webpack-compatible compiler hooks.
- The CSS extract plugin ensures there is a concrete CSS asset for StyleX to append to.

## CSS entry point (`src/global.css`)

The app imports `src/global.css` so every build produces `index.css`. The StyleX plugin appends its aggregated CSS to that file during both dev and production builds.

## Commands

```bash
# Start the Rspack dev server with StyleX transforms
npm run example:dev

# Production build with aggregated StyleX CSS in dist/index.css
npm run example:build
```

Execute the scripts from `examples/example-rspack`. The `dist/` output already contains the StyleX CSS merged into `index.css`.
