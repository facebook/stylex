# Changelog

## 0.13.0

### New features

* Add `positionTry` API for creating `@property-try` declarations.
* Add `defineConsts` API for inlining constant values.
* Re-write of the runtime style injection module to be more reliable.

### Breaking changes

* The `runtimeInjection` compiler option is now disabled by default when `dev` is true.
* The ESLint rule `no-legacy-conditional-styles` is renamed to `no-legacy-contextual-styles`.
* The `useRemForFontSize` compiler option is renamed to `enableFontSizePxToRem`. It is disabled by default and should not be used directly.

### Fixes

* Fix the TypeScript types for themes and types functions.
* Fix the creation of duplicate classNames when defining nested pseudo-classes.
* Fix that allows the ESLint plugin to support use of `importSources` object syntax in `validImports`.
* Fix incorrect compiler error messages.
* Fix a bug that incorrectly wrapped CSS variables in quotes when used in the `content` property.
* Fix a bug in the `firstThatWorks` API when the last value was a variable.
* The `genConditionalClasses` compiler option is renamed to `enableInlinedConditionalMerge`. It is enabled by default and should not be used directly.

### Deprecations

* Deprecate `@stylexjs/shared` package.

## 0.12.0 (Apr 10, 2025)

### New features

* Hash keys in compiled style objects to reduce generated code size.
* New eslint rule to flag use of legacy Media Query and pseudo-class syntax.

### Fixes

* Fix pseudo-elements bug in dynamic styles.
* Performance improvements to `stylex.createTheme` compilation by caching object evaluation.
* Disallow spreading in `stylex.create` calls.

### Deprecations

* Deprecate `@stylexjs/dev-runtime` package.
* Deprecate `@stylexjs/esbuild-plugin` package.
* Deprecate `@stylexjs/nextjs-plugin` package.
* Deprecate `@stylexjs/open-props` package.
* Deprecate `@stylexjs/webpack-plugin` package.


## 0.11.1 (Mar 3, 2025)

### Fixes

* Fix `style.create` compilation regression for string and number keys.
* Fix babel path resolution within monorepos.


## 0.11.0 (Feb 27, 2025)
