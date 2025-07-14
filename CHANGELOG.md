# Changelog

## 0.14.2 (Jul 14, 2025)

### Fixes

* ESLint plugin style validation for length properties (#1136)
* Remove legacy RTL flipping of boxShadow, cursor, textShadow values.

## 0.14.1 (Jul 3, 2025)

### Fixes

* Another fix for TypeScript types.

## 0.14.0 (Jun 30, 2025)

### New features

* Add `viewTransitionClass` API for creating CSS View Transitions.
* ESLint plugin includes `validImports` options for all rules.
* ESLint plugin includes autofix for all remaining nonstandard CSS properties when using the `valid-styles` rule.

### Breaking changes

* Make `property-specificity` the default `styleResolution`.

### Fixes

* Fix theming in dev/debug mode.
* Avoid putting certain `@-rules` in `@layer` blocks.
* Fix type exports for TypeScript.

## 0.13.1 (May 21, 2025)

### Fixes

* Export additional Types.

## 0.13.0 (May 19, 2025)

### New features

* Add `positionTry` API for creating `@property-try` declarations.
* Add `defineConsts` API for inlining constant values.
* Re-write of the runtime style injection module to be more reliable.

### Breaking changes

* The `runtimeInjection` compiler option is now disabled by default when `dev` is true.
* The ESLint rule `no-legacy-conditional-styles` is renamed to `no-legacy-contextual-styles`.
* The `useRemForFontSize` compiler option is renamed to `enableFontSizePxToRem`. It is disabled by default and should not be used directly.
* The `genConditionalClasses` compiler option is renamed to `enableInlinedConditionalMerge`. It is enabled by default and should not be used directly.
* The `attrs` API is removed due to low usage and redundancy with the `props` API.

### Fixes

* Fix the TypeScript types for themes and types functions.
* Fix the creation of duplicate classNames when defining nested pseudo-classes.
* Fix that allows the ESLint plugin to support use of `importSources` object syntax in `validImports`.
* Fix incorrect compiler error messages.
* Fix a bug that incorrectly wrapped CSS variables in quotes when used in the `content` property.
* Fix a bug in the `firstThatWorks` API when the last value was a variable.
* Allow `importSources` to be configured in the PostCSS plugin for React Strict DOM compatibility.

### Deprecations

* Deprecate `@stylexjs/shared` package.

## 0.12.0 (Apr 10, 2025)

### New features

* Hash keys in compiled style objects to reduce generated code size.
* New eslint rule to flag use of legacy Media Query and pseudo-class syntax.

### Fixes

* Fix pseudo-elements bug in dynamic styles.
* Performance improvements to `createTheme` compilation by caching object evaluation.
* Disallow spreading in `create` calls.

### Deprecations

* Deprecate `@stylexjs/dev-runtime` package.
* Deprecate `@stylexjs/esbuild-plugin` package.
* Deprecate `@stylexjs/nextjs-plugin` package.
* Deprecate `@stylexjs/open-props` package.
* Deprecate `@stylexjs/webpack-plugin` package.


## 0.11.1 (Mar 3, 2025)

### Fixes

* Fix `create` compilation regression for string and number keys.
* Fix babel path resolution within monorepos.


## 0.11.0 (Feb 27, 2025)
