# Contributing

## Reporting Issues and Asking Questions

Before opening an issue, please search the issue tracker to make sure your issue hasn't already been reported. Please note that your issue may be closed if it doesn't include the information requested in the issue template.

## Getting started

Visit the issue tracker to find a list of open issues that need attention.

Fork, then clone the repo:

```
git clone https://github.com/your-username/stylex.git
```

Make sure you have npm@>=7 and node@>=0.12.15 installed. Then install the package dependencies:

```
npm install
```

## Automated tests

To run the linter:

```
npm run lint
```

To run flow:

```
npm run flow
```

To run all the unit tests:

```
npm run tests
```

…in watch mode:

```
npm run tests -- --watch
```

## Compile and build

To compile the source code:

```
npm run build
```

### New Features

Please open an issue with a proposal for a new feature or refactoring before starting on the work. We don't want you to waste your efforts on a pull request that we won't want to accept.

## Pull requests

**Before submitting a pull request**, please make sure the following is done:

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure the tests pass (`npm run test`).

You can now submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

## High-Level Architecture

### Babel

StyleX expects you to transform all `js`/`ts`/`tsx` files with `babel-plugin-transform-stylex`.
In addition to transforming JS code, this plugin also produces an Array of CSS rules. All the CSS rules
generated from all JS files within your project should be concatenated together and converted to a CSS
file using the `processStyles` function which is also exported from the same module.

(NOTE: StyleX only uses RTL-friendly logical values of `start` and `end` and disallows using `left` and `right` entirely.)

`babel-plugin-transform-stylex` is fairly lightweight. It pre-computes `stylex` related functions like
`stylex.create` and `stylex.keyframes` by converting the argument AST to a JS object and transforming them
by passing them to the functions of the corresponding names within `@stylex/shared`

### Shared (`@stylexjs/shared`)

Most of the core business logic lives within this pacakge. Unless you're adding a new function to the Stylex API,
you'll most likely be making changes within this package.

The good news is that this package is completely vanilla Javascript and you don't need to learn anything about Babel to
be able to contribute.

This Package exports two primary functions `create` and `keyframes`.

1. `create` - Takes an Style Object. It then create a unique className for each style property by hashing it. And returns a transformed
   object where the values have been replaced with the classNames. It also returns a second value, which is a list of injected styles.
2. `keyframes` - Takes `@keyframes` animation as JS object, Hashes it and returns a string and a Style Rule to be injected.

#### ⭐️ `create`

The `stylex.create` function is implemented here and can be found within `stylex-create.js` and is the default export of a function named `styleXCreateSet(...)`.

##### `styleXCreateSet(...)`

> The function is called `styleXCreateSet` because `stylex.create` transforms a "set" or collection of multiple style [namespaces](#namespace)

This function itself mostly just traverses over the objects to run each [namespaces](#namespace) through the `styleXCreateNamespace(...)` function. Other than that, it takes the styles to be injected from each namespace in a [Namespace Set](#namespace-set) and deduplicates them so the style isn't injected multiple times if it's used within multiple Namespaces in the same set.

##### `styleXCreateNamespace(...)`

> This function has been kept separate in case we want to add a new function to the StyleX API in the future called `stylex.createOne` which transforms a single [namespace](#namespace) instead of a [Namespace Set](#namespace-set)

This function is responsible to transforming a [namespace](#namespace) to a [Compiled Namespace](#compiled-namespace) by hashing each key value pair and returning an object where the values have been replaced by classNames.

**Step 1**

The first step here is expanding all [shorthands](#shorthands) into their individual properties. To do this we `.flatMap` over the object entries of the Namespace and use the `expandShorthands(...)` function defined within `expand-shorthands.js`

**Step 2**

We hash each style `[key, value]` pair and generate a className and an associated CSS rule. Thie is done in the `convertToClassName(...)` function defined within [`convert-to-className.js`](#convert-to-classname-shared-package). (Explained below)

**Step 3**

Using the classNames generated in _step 2_ above, we collect all the individual style keys along with their associated classNames in the `resolvedNamespace` object.

All the generated CSS rules from _step 2_ are collected in the `injectedStyles` object.

The `[resolvedNamespace, injectedStyles]` is returned.

##### Back to `styleXCreateSet(...)`

`styleXCreateSet(...)` takes all the `[resolvedNamespace, finalInjectedStyles]` tuples and returns a tuple of `[compiledNamespaceSet, allInjectedStyles]`

### Back to `create` with the `babel-plugin-transform-stylex` package

The `create` function within the babel plugin package takes the `stylex.create(...)` function call and replaces it with the `compiledNamespaceSet`.

It also takes each of the `injectedStyles` and:

1. Either injects it as a `stylex.inject` call (if in `dev` mode)
2. Or, adds it to the array of injected styles on [`babel.state.metadata`](#babel-metadata)

#### ⭐️ `keyframes`

This is the function backing `stylex.keyframes`. It works similarly to `create` but it's more simplified since it only defines a single CSS `@keyframes` rule and returns a single string.

Here again, the source AST is converted to a JS object and passed to `stylex-keyframes.js` within the `shared` package.

There, first the shorthands are expanded and then the whole objects is hashed. The resulting hash is used as the generated `animation name` for a `@keyframes` rule.

The "name" and the CSS `@keyframes` rules are returned as a tuple.

The `stylex.keyframes` call is replaced with the final string.

The CSS `@keyframes` rule is either injected using `stylex.inject` in dev mode or set onto the `stylex` array on [`babel.state.metadata`](#babel-metadata).

#### `convert-to-className` (`shared` package)

This function is responsible for converting a single style key-value pair into a tuple of `[key, className, CSSRules]`

It does so in the following steps:

1. Convert the camelCased keys that are used by end-users to define [Namespaces](#namespace) and convert them to the dash-separated keys used within CSS.
2. Hash `key` + (any `pseudo` or `at-rule`) + `value` to generate a className
3. Generate the CSS rule using the `generateCSSRule` function defined in [`generate-css-rule.js`](#generate-css-rulejs) in the `shared` package.

#### `generate-css-rule.js`

This function takes a CSS key value pair, checks if has an RTL counterpart and returns them along side a pre-configured priority based on the type of CSS rule it is.

### ESLint

The ESLint rule is a standalone ESLint plugin that mostly maintains an `allowlist` for valid styles and their valid values.

This was originally created from Flow types which is why it's currently not very powerful.

### Webpack / Rollup / Next.js

There are plugins for Webpack/Rollup and Next.JS that are built atop the Babel plugin.

### RTL Handling

Currently, StyleX is only able to support LTR or RTL globally. It's not possible to have sub-trees of the UI that are RTL in an otherwise LTR page.

(This is considered an issue that will be fixed in a future update.)

StyleX disallows the usage of any styles that use the words `left` or `right`, instead requiring the use `start` and `end` instead.

Whenever such styles are encountered, the CSS rule generated by StyleX has two variants for `ltr` and `rtl`. (Other rules that are the same for LTR and RTL omit the `rtl` value)

## Glossary of Terms

We use a set of names when talking about various concepts within StyleX. It can be useful to know what they mean.

### Namespace

> **alias:** Style Object

This is an object mapping style properties to values. It can also contain nested objects for pseudo selectors and `@`-rules like `@media`.

e.g.

```js
{
   color: 'red',
   margin: 0,
   ':hover': {
      color: 'blue'
   },
   '@media (max-width: 720px)': {
      margin: 8
   },
}
```

### Namespace Set

> **alias:** Style Configuration

This is an object mapping string keys to Namespaces. This is the type of the argument taken by `stylex.create`.

e.g.

```js
{
   foo: {color: 'red'},
   bar: {margin: 0},
}
```

### Compiled Namespace

> **alias:** Resolved Namespace
> **alias:** Compiled Style Object

This is a Namespace where the values have been replaced by classNames instead. `stylex.create` converts Namespaces into this.

### Compiled Styles

> **alias:** Compiled Namespace Set

This is the return value of `stylex.create`. This is an object mapping string keys to Compiled Namespaces.

### Preset

A preset is a Compiled Namespace that is being included by spreading within an uncompiled Namespace while defining new styles.

```js
// An object mapping keys to "presets"
const presets = stylex.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    end: 0,
    bottom: 0,
    start: 0,
  },
});

// in the same file or elsewhere
const styles = stylex.create({
  foo: {
    // Currently, to use a preset you have to annotate it with a type.
    ...(presets.absoluteFill: XStyle<>),
    // In the future, the API will be to use a function call instead.
    // ...stylex.extends(presets.absoluteFill),
    color: 'red',
  },
});
```

### Shorthand

This is CSS property that is a shorthand for multiple individual properties.

e.g. `margin` is a shorthand for `marginTop`, `marginEnd`, `marginBottom` and `marginStart`.

(NOTE: StyleX only uses RTL-friendly logical values of `start` and `end` and disallows using `left` and `right` entirely.)

## Babel Metadata

The StyleX Babel plugin does more than transform Javascript (or Typescript) files. It also returns a list of injected styles. The way that such a value can be returned while transforming a JS file is by using Babel's `metadata` API.

An example of this can be seen in some of the tests, but the result of using Babel's `transform(...)` function returns an object contains at least two keys:

1. `code` which is the transformed JS code
2. `metadata` is an object of metatdata that the plugin may want to return as a side-effect.

e.g.

```js
const result = transformSync(sourceCode, {
  filename: opts.filename,
  parserOpts: { flow: { all: true } },
  plugins: [stylexPlugin, opts],
});

const transformedCode = result.code;
const injectedStyles = result.metadata.stylex;
```

---

Thank you for contributing!
