# Changelog

## 0.12.0 (Apr 10, 2025)

### New features

* Hash keys in compiled style objects to reduce generated code size.
* Added lint rule to flag legacy media query/pseudoclass syntax.

### Fixes
* Fix pseudo-elements bug in dynamic styles.
* Performance improvements to `stylex.createTheme` compilation by caching object evaluation.
* Disallowed spreading in `stylex.create` calls.

### Deprecations

* Deprecate `dev-runtime` package.
* Deprecate `esbuild-plugin` package.
* Deprecate `nextjs-plugin` package.
* Deprecate `open-props` package.
* Deprecate `webpack-plugin` package.


## 0.11.1 (Mar 3, 2025)

### Fixes

* Fix `style.create` compilation regression for string and number keys.
* Fix babel path resolution within monorepos.


## 0.11.0 (Feb 27, 2025)
