# Next.js example using StyleX

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) which then uses
the StyleX Babel and PostCSS plugins to compile StyleX.

## Getting Started

First, run the development server:

```bash
npm run example:dev
# or
yarn example:dev
# or
pnpm example:dev
# or
bun example:dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Setup

Enabling StyleX compilation involves three steps:

### Define the `babel.config.js` file

```tsx
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      // See all options in the babel plugin configuration docs:
      // https://stylexjs.com/docs/api/configuration/babel-plugin/
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: {
          '@/*': [path.join(__dirname, '*')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
        },
      },
    ],
  ],
};
```

Ensure that the `next/babel` preset is used as well as the `@stylexjs/babel-plugin` with your configuration.
It is preferable to use a JS/TS file for this config to help in the next part...

### Define the `postcss.config.js`

```tsx
const babelConfig = require('./babel.config');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
```

Here, the `@stylexjs/postcss-plugin` must be used and configured. The `include` property takes a list of glob patterns
to find all the files where styles should be extracted.

`babelConfig` should be configured with at least the same StyleX Babel plugin as in your Babel config. It is important
to ensure that your Babel config file and your PostCSS config are configured with the same options, so it's usually
best to import your Babel config from your PostCSS config to share it.

### Ensure a CSS file is imported by every route of your app

It's usually best to do this by global layout. The CSS file *must* contain the `@stylex` directive.

```css
/**
 * Any reset styles
 */
@layer resets {
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
}

/**
 * The @stylex directive is used by the @stylexjs/postcss-plugin.
 * It is automatically replaced with generated CSS during builds.
 */
@stylex;
```

---

Once these two files are defines, Next.js will automatically use Babel to transform your JS file with the StyleX plugin
and the PostCSS plugin will be used to generate your final CSS file
