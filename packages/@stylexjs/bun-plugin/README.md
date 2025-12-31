# @stylexjs/bun-plugin

## Documentation Website
[https://stylexjs.com](https://stylexjs.com)

## Installation

Install the package by using:
```bash
npm install --save-dev @stylexjs/bun-plugin
```

or with bun:

```bash
bun add --dev @stylexjs/bun-plugin
```

## Usage

Create a build script (e.g., `build.ts`):

```typescript
import stylexPlugin from '@stylexjs/bun-plugin';

await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  plugins: [
    stylexPlugin({
      useCSSLayers: true,
    }),
  ],
});
```

Run the build:
```bash
bun run build.ts
```

## Plugin Options

It inherits all options from `@stylexjs/babel-plugin` and can be found [here 🔗](https://stylexjs.com/docs/api/configuration/babel-plugin/). Along with other options like:

### fileName
```js
fileName: string // Default: 'stylex.css'
```
The name of the output CSS file (used as fallback if no existing CSS file is found). Supports `[hash]` placeholder for content-based hashing.

---

### useCSSLayers
```js
useCSSLayers: boolean // Default: false
```
Enabling this option switches StyleX from using `:not(#\#)` to using `@layers` for handling CSS specificity.

---

### babelConfig
```js
babelConfig: {
  plugins: PluginItem[],
  presets: PluginItem[]
} // Default: { plugins: [], presets: [] }
```
List of custom Babel plugins and presets which can be used during code transformation.

---

### lightningcssOptions
```js
lightningcssOptions: TransformOptions // Default: {}
```
Options passed to [lightningcss](https://lightningcss.dev/) for CSS processing and minification.

## How It Works

The Bun plugin:

1. **Intercepts** JavaScript/TypeScript file loads during bundling via `onLoad` hook
2. **Transforms** files containing StyleX imports using Babel
3. **Collects** CSS rules from all transformed modules
4. **Processes** the collected CSS with lightningcss via `onEnd` hook
5. **Appends** the StyleX CSS to any existing CSS file in the output directory (or creates a new one)

## Example

See the `examples/example-bun` directory for a complete working example.
