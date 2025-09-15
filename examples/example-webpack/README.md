# Webpack Example with StyleX

This example demonstrates how to configure StyleX with Webpack for a React application. This example uses `@stylexjs/babel-plugin` and `@stylexjs/postcss-plugin` to process StyleX code at build time.

### Prerequisites
Set up the following dependencies:
- PostCSS: https://webpack.js.org/loaders/postcss-loader/
- Babel: https://webpack.js.org/loaders/babel-loader/

## Overview

This setup includes:
- **Webpack** for bundling
- **Babel** for JavaScript/JSX transformation with StyleX plugin
- **PostCSS** for CSS processing with StyleX plugin
- **ESLint** for StyleX-specific linting rules

## Configuration Files

### 1. Package Dependencies (`package.json`)

```bash
# Install runtime stylex package
npm install @stylexjs/stylex

# Install dev dependencies
npm install -D @stylexjs/babel-plugin @stylexjs/eslint-plugin @stylexjs/postcss-plugin
```

### 2. Babel Configuration (`.babelrc.js`)

The Babel plugin transforms StyleX code at compile time:

```javascript
module.exports = {
  plugins: [
    /* ADD STYLEX BABEL PLUGIN */
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        test: process.env.NODE_ENV === 'test',
        runtimeInjection: process.env.NODE_ENV === 'development',
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
        },
      },
    ],
  ],
};
```

### 3. PostCSS Configuration (`postcss.config.js`)

The PostCSS plugin processes CSS and generates StyleX stylesheets:

```javascript
module.exports = {
  plugins: {
    /* ADD STYLEX POSTCSS PLUGIN */
    '@stylexjs/postcss-plugin': {
      include: [
        './src/**/*.{js,jsx,ts,tsx}',
        // Include NPM dependencies that use StyleX like './node_modules/<package-name>/**/*.{js,jsx,ts,tsx}'
      ],
      useCSSLayers: true
    },
    autoprefixer: {},
  }
};
```

### 4. ESLint Configuration (`.eslintrc.js`)

StyleX-specific linting rules:

```javascript
module.exports = {
  plugins: ['@stylexjs'],
  rules: {
    '@stylexjs/valid-styles': 'error',
    '@stylexjs/no-unused': 'error', 
    '@stylexjs/valid-shorthands': 'warn',
    '@stylexjs/sort-keys': 'warn'
  },
};
```

### 6. CSS entry point (`src/app.css`)

The CSS file includes the StyleX injection point:

```css
/* The @stylex directive is used by the StyleX PostCSS plugin.
 * It will be replaced with generated CSS at build time.
 */
/* @stylex-injection-point */
@stylex;
```

**Important:** The `@stylex;` directive is replaced with generated CSS at build time.


## Build Process

1. **Babel** transforms StyleX code and extracts style definitions
2. **PostCSS** processes CSS files and generates optimized stylesheets
3. **Webpack** bundles everything together
4. **ESLint** validates StyleX usage

## Commands

```bash
# Development server
npm run dev

# Production build  
npm run build

# Serve built files
npm run serve
```