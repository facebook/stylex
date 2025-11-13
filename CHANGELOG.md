# Changelog

## master

- - Add `env` compiler option to expose `stylex.env` compile-time constants.

## 0.16.3 (Oct 27, 2025)

- Add configs to `sort-keys` property ordering.
- Create new `defineConsts` specific file extension.
- Add `defineConsts` and various file extension support to `enforce-extension`.
- Add config for custom module resolution.
- Turn `enableMediaQueryOrder` on by default.
- Updates to docs and Flow.

## 0.16.2 (Oct 13, 2025)

- Handle descendant selector styles in `valid-styles` rule.
- Adjust descendant selector `.when` priorities.
- Fix `defineVars` and `createTheme` at-rules priorities.
- Update `defineConsts` types for non-stylex usage.

## 0.16.1 (Oct 2, 2025)

- New `no-lookahead-selector` lint rule to flag certain descendant and sibling
  selectors.
- Fix priorities for descendant and sibling selectors.
- Fix color functions for `valid-shorthands` rule.
- Fix hoisting issues with duplicate keys in `create` calls.
- Add storybook example.

## 0.16.0 (Sep 25, 2025)

- Added support for descendant and shared selectors.
- Support CSS variable overrides with `defineConsts`.
- Add `valid-styles` support to CSS variable overrides in `create` calls.
- Replace `valid-styles` object check with Flow typing

## 0.15.4 (Sep 7, 2025)

- Add configuration modes to `processStylexRules`.
- Support local resolved constants, `positionTry`, and '0' values in
  `valid-styles` ESLint rule.
- Implement `defineConsts` for dynamic styles.
- Create `.transformed` file extension for preresolved variables.

## 0.15.3 (Aug 13, 2025)

- Optimize precomputed `props` calls in JSX.
- Fix class name construction for dynamic contextual styles.
- Handle all unit values in media query rewriting.

## 0.15.2 (Aug 1, 2025)

- Exclude private dependencies from `@stylexjs/babel-plugin` package.
- Reduce chances of dynamic variable name collisions.

## 0.15.1 (Aug 1, 2025)

### Fixes

- Hoist stylex.create and static className objects to the top level for support
  inside functions.

## 0.15.0 (Jul 31, 2025)

### New features

- Enable media query ordering and parsing behind `enableMediaQueryOrder` flag.
- Integrate media query parser for automatic media query validation and
  normalization.

### Fixes

- Implement merging of width, height, and ranges in media query transformer.
- Optimize dynamic styles output for conditionals and template literals.
- Fix TypeScript types for `stylex.types.*` functions.
- Fix opaque type issues for InlineStyles.

## 0.14.3 (Jul 22, 2025)

### Fixes

- Do not emit class names for `null` or `undefined` dynamic styles.
- Optimize dynamic styles output for binary and unary expressions.

## 0.14.2 (Jul 14, 2025)

### Fixes

- ESLint plugin style validation for length properties (#1136)
- Remove legacy RTL flipping of boxShadow, cursor, textShadow values.

## 0.14.1 (Jul 3, 2025)

### Fixes

- Another fix for TypeScript types.

## 0.14.0 (Jun 30, 2025)

### New features

- Add `viewTransitionClass` API for creating CSS View Transitions.
- ESLint plugin includes `validImports` options for all rules.
- ESLint plugin includes autofix for all remaining nonstandard CSS properties
  when using the `valid-styles` rule.

### Breaking changes

- Make `property-specificity` the default `styleResolution`.

### Fixes

- Fix theming in dev/debug mode.
- Avoid putting certain `@-rules` in `@layer` blocks.
- Fix type exports for TypeScript.

## 0.13.1 (May 21, 2025)

### Fixes

- Export additional Types.

## 0.13.0 (May 19, 2025)

### New features

- Add `positionTry` API for creating `@property-try` declarations.
- Add `defineConsts` API for inlining constant values.
- Re-write of the runtime style injection module to be more reliable.

### Breaking changes

- The `runtimeInjection` compiler option is now disabled by default when `dev`
  is true.
- The ESLint rule `no-legacy-conditional-styles` is renamed to
  `no-legacy-contextual-styles`.
- The `useRemForFontSize` compiler option is renamed to `enableFontSizePxToRem`.
  It is disabled by default and should not be used directly.
- The `genConditionalClasses` compiler option is renamed to
  `enableInlinedConditionalMerge`. It is enabled by default and should not be
  used directly.
- The `attrs` API is removed due to low usage and redundancy with the `props`
  API.

### Fixes

- Fix the TypeScript types for themes and types functions.
- Fix the creation of duplicate classNames when defining nested pseudo-classes.
- Fix that allows the ESLint plugin to support use of `importSources` object
  syntax in `validImports`.
- Fix incorrect compiler error messages.
- Fix a bug that incorrectly wrapped CSS variables in quotes when used in the
  `content` property.
- Fix a bug in the `firstThatWorks` API when the last value was a variable.
- Allow `importSources` to be configured in the PostCSS plugin for React Strict
  DOM compatibility.

### Deprecations

- Deprecate `@stylexjs/shared` package.

## 0.12.0 (Apr 10, 2025)

### New features

- Hash keys in compiled style objects to reduce generated code size.
- New eslint rule to flag use of legacy Media Query and pseudo-class syntax.

### Fixes

- Fix pseudo-elements bug in dynamic styles.
- Performance improvements to `createTheme` compilation by caching object
  evaluation.
- Disallow spreading in `create` calls.

### Deprecations

- Deprecate `@stylexjs/dev-runtime` package.
- Deprecate `@stylexjs/esbuild-plugin` package.
- Deprecate `@stylexjs/nextjs-plugin` package.
- Deprecate `@stylexjs/open-props` package.
- Deprecate `@stylexjs/webpack-plugin` package.

## 0.11.1 (Mar 3, 2025)

### Fixes

- Fix `create` compilation regression for string and number keys.
- Fix babel path resolution within monorepos.

## 0.11.0 (Feb 27, 2025)
