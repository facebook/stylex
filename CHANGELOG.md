# Changelog

## 0.12.0 (Apr 10, 2025)

### New features

* Hash keys in compiled style objects to reduce generated code size.
* New eslint rule to flag use of legacy Media Query and pseudo-class syntax.

### Fixes

* Fix pseudo-elements bug in dynamic styles.
* Performance improvements to `stylex.createTheme` compilation by caching object evaluation.
* Disallow spreading in `stylex.create` calls.

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
