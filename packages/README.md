# @stylexjs Packages

This directory contains all the packages for the StyleX project.

## Package Structure

```
packages/
├── babel-plugin/          # @stylexjs/babel-plugin
├── eslint-plugin/         # @stylexjs/eslint-plugin
├── webpack-plugin/        # @stylexjs/webpack-plugin
├── rollup-plugin/         # @stylexjs/rollup-plugin
├── postcss/               # @stylexjs/postcss
├── open-props/            # @stylexjs/open-props
├── stylex/                # stylex (main library)
└── dev-utils/             # Development utilities
```

## @stylexjs/babel-plugin

Located at: `packages/babel-plugin/`

This plugin is responsible for:
- Transform StyleX function calls into optimized CSS
- Generate static class names
- Extract styles for CSS output
- Support for dynamic values and theme variables

See `packages/babel-plugin/README.md` for more details.
