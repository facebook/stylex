# StyleX Bun Example

This example demonstrates how to use StyleX with Bun's bundler using the `@stylexjs/bun-plugin` package.

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or later

## Setup

```bash
// needed to avoid recursive loop
bun install --ignore-scripts
```

## Build

```bash
bun run example:build
```

This will:
1. Bundle the React application with StyleX transformations
2. Create the JavaScript bundle in `public/dist/App.js`
3. Generate CSS (appended to any existing CSS file in the output directory, or create a fallback `stylex.css`)

## Run

Open `public/index.html` in your browser to see the result.

## How it works

The build script (`scripts/build.ts`) uses the `@stylexjs/bun-plugin`:

```typescript
import stylexPlugin from '@stylexjs/bun-plugin';

await Bun.build({
  entrypoints: ['./src/App.tsx'],
  outdir: './public/dist',
  plugins: [
    stylexPlugin({
      useCSSLayers: true,
    }),
  ],
});
```

The plugin:
1. Intercepts JavaScript/TypeScript file loads via Bun's `onLoad` hook
2. Transforms StyleX code using Babel
3. Collects CSS rules from all transformed modules
4. Uses Bun's `onEnd` hook to append the StyleX CSS to any existing CSS file in the output directory (or creates a new file using the `fileName` option as fallback)

## Options

See [StyleX Babel Plugin Configuration](https://stylexjs.com/docs/api/configuration/babel-plugin/) for all available options.

Common options:
- `fileName`: Fallback CSS filename if no existing CSS file is found (default: `'stylex.css'`)
- `useCSSLayers`: Enable CSS layers for better specificity control
- `importSources`: Array of module sources to transform (default: `['stylex', '@stylexjs/stylex']`)
- `unstable_moduleResolution`: Configure module resolution for design tokens
