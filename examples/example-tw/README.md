# example-tw

This example demonstrates how to use [tailwind-to-stylex](https://github.com/nmn/tw-to-stylex) to write Tailwind CSS classes that get transformed to StyleX at build time.

## Features

- **Standard Tailwind Syntax**: Write familiar `className="flex p-4 bg-blue-500"` attributes
- **Build-time Transformation**: The Babel plugin converts Tailwind classes to StyleX at compile time
- **Atomic CSS Output**: All styles are compiled to optimized atomic CSS via StyleX
- **Shared UI Components**: Works alongside native StyleX components like `@stylexjs/shared-ui`

## How It Works

You write standard Tailwind CSS classes:

```tsx
<div className="flex gap-4 p-8 bg-blue-500 text-white">
  Content
</div>
```

The `tailwind-to-stylex` Babel plugin transforms this at build time to:

```tsx
import * as _stylex from '@stylexjs/stylex';

<div {..._stylex.props(_styles.$1)}>
  Content
</div>

const _styles = _stylex.create({
  $1: {
    display: 'flex',
    gap: '1rem',
    padding: '2rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
});
```

This gives you:
- Tailwind's familiar class-based syntax for rapid development
- StyleX's optimized atomic CSS output
- No runtime overhead - all transformation happens at build time

## Configuration

### babel.config.js

The Babel config includes both plugins in the correct order:

```js
module.exports = {
  presets: ['next/babel'],
  plugins: [
    // tailwind-to-stylex transforms className to StyleX first
    'tailwind-to-stylex',
    // Then StyleX babel plugin processes the generated code
    ['@stylexjs/babel-plugin', { /* options */ }],
  ],
};
```

### postcss.config.js

The PostCSS config uses the StyleX plugin to extract CSS:

```js
module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['app/**/*.{js,jsx,ts,tsx}'],
      babelConfig: {
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
```

### app.css

Import the Tailwind theme CSS and include the @stylex directive:

```css
@import 'tailwind-to-stylex/theme.css';
@stylex;
```

## Running the Example

```bash
# Install dependencies
npm install

# Start development server
npm run example:dev

# Build for production
npm run example:build

# Start production server
npm run example:start
```

## Mixing with Native StyleX

You can use both Tailwind syntax and native StyleX in the same project:

```tsx
import { Button } from '@stylexjs/shared-ui';

// Tailwind classes on HTML elements
<div className="flex gap-4 p-8">
  {/* Native StyleX component */}
  <Button onClick={handleClick}>Click me</Button>
</div>
```

The `@stylexjs/shared-ui` Button component uses native StyleX internally, demonstrating how both approaches work together seamlessly.
