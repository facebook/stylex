# @stylexjs/esbuild-plugin

Use StyleX with _esbuild_ bundler.

This plugin transforms files that contain `stylexjs` imports and generates a
`stylexjs` `CSS` bundle.

## Installation

```
npm install --save-dev @stylexjs/esbuild-plugin
```

## Usage

```typescript
import esbuild from 'esbuild';
import stylexPlugin from '@stylexjs/stylex';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: './build/bundle.js',
  minify: true,
  plugins: [
    stylexPlugin({
      // If set to 'true', bundler will inject styles in-line
      // Do not use in production
      dev: false,
      // Required. File path for the generated CSS file
      generatedCSSFileName: path.resolve(__dirname, 'build/stylex.css'),
      // Aliases for StyleX package imports
      // default: '@stylexjs/stylex'
      stylexImports: ['@stylexjs/stylex'],
      // Required for CSS variable support
      unstable_moduleResolution: {
        // type: 'commonJS' | 'ESModules' | 'haste'
        // default: 'commonJS'
        type: 'commonJS',
        // The absolute path to the root of your project
        rootDir: __dirname,
      },
    }),
  ],
});
```

You can see the example usage
[here](https://github.com/facebook/stylex/apps/esbuild-example).
