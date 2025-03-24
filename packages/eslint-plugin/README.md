# @stylexjs/eslint-plugin

The ESLint rule is a standalone ESLint plugin that mostly maintains an
`allowlist` for valid styles and their valid values.

## Installation

```sh
npm install --save-dev @stylexjs/eslint-plugin
```

## Enable Flow Types

If you need to import this package in an environment where you need the Flow
type definitions shipped with this package to work, please add the following
options to your `.flowconfig` file:

```
module.system.node.resolve_dirname=flow_modules
module.system.node.resolve_dirname=node_modules
```

This will fix the missing types for `eslint` and `estree`.

## Enabling the plugin and rules

Once you've installed the npm package you can enable the plugin and rules by
opening your ESLint configuration file and adding the plugin and rules.

```json
{
  "rules": {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/sort-keys": "warn"
  },
  "plugins": ["@stylexjs"]
}
```

## All the rules

### @stylexjs/valid-styles

StyleX requires styles that are statically analyzable. This rule will detect
invalid styles that StyleX cannot handle and provides basic type checking for style values.

#### Disallowed CSS properties and suggested fixes

Listed are common CSS properties that are **not allowed** in StyleX, along
with their **suggested replacements**.

### @stylexjs/sort-keys

This rule helps to sort the StyleX property keys according to
[property priorities](https://github.com/facebook/stylex/blob/main/packages/shared/src/utils/property-priorities.js).

### stylex/stylex-valid-shorthands

This ESLint rule enforces the use of individual longhand CSS properties in place
of multivalue shorthands when using `stylex.create` for reasons of consistency
and performance. The rule provides an autofix to replace the shorthand with the
equivalent longhand properties.

#### Disallowed: `margin`, `padding` with multiple values

Using multivalue shorthands that StyleX cannot safely split into equivalent
longhands:

- `margin: '8px 16px'`
- `padding: '8px 16px 8px 16px'`

**Fix:** Replace with equivalent longhands. Note: this is autofixable.

##### Disallowed: `font`

**Why:** `font` is a shorthand that overrides multiple font settings at once.

**Fix:** Replace with individual font properties. Note: this is autofixable.

- `fontSize`
- `fontFamily`
- `fontStyle`
- `fontWeight`

##### Disallowed: `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`

**Fix:** Replace with individual sub-properties. Note: this is autofixable.

- `borderWidth`
- `borderStyle`
- `borderColor`

#### Config options

This rule has a few custom config options that can be set.

```js
{
  allowImportant: false,                       // Whether `!important` is allowed
  preferInline: false                          // Whether the expansion uses logical direction properties over physical
}
```

### @stylexjs/stylex-enforce-extension

This rule ensures consistent naming for StyleX theme files that export variables
using `stylex.defineVars()`.

#### Not allowed

- Exporting `stylex.defineVars()` in a file **not** ending in `.stylex.js` or
  `.stylex.ts`
- Using the `.stylex.js` / `.stylex.ts` extension without exporting
  `stylex.defineVars()`
- Mixing `stylex.defineVars()` with other exports in the same file

#### Instead...

- Use `.stylex.js` or `.stylex.ts` for files that only export
  `stylex.defineVars()`
- Export **only** theme vars from these files

#### Config options

```json
{
  "themeFileExtension": ".stylex.js" // default, can be customized
}
```

### `stylex-no-unused`

This rule flags unused styles created with `stylex.create(...)`. If a style key
is defined but never used, the rule auto-strips them from the create call.
