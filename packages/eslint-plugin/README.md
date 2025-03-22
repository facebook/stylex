# @stylexjs/eslint-plugin

The ESLint rule is a standalone ESLint plugin that mostly maintains an
`allowlist` for valid styles and their valid values.

This was originally created from Flow types which is why it's currently not very
powerful.

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
invalid styles that stylex cannot handle.

#### Disallowed CSS properties and suggested fixes

This guide lists common CSS properties that are **not allowed** in StyleX, along
with their **suggested replacements**. The goal is to encourage explicit,
modular, and logical CSS, with an explicit preference for longhand values.

##### Disallowed: Logical styles for `margin` and `padding`. Note: this is autofixable.

## Logical styles for `margin` and `padding`

To support better internationalization and writing-mode agnosticism, avoid
directional or alias properties for margins and paddings. Use CSS logical
properties instead.

| Not allowed         | Use instead          |
| ------------------- | -------------------- |
| `marginStart`       | `marginInlineStart`  |
| `marginEnd`         | `marginInlineEnd`    |
| `marginTop`         | `marginBlockStart`   |
| `marginBottom`      | `marginBlockEnd`     |
| `marginHorizontal`  | `marginInline`       |
| `marginVertical`    | `marginBlock`        |
| `paddingStart`      | `paddingInlineStart` |
| `paddingEnd`        | `paddingInlineEnd`   |
| `paddingTop`        | `paddingBlockStart`  |
| `paddingBottom`     | `paddingBlockEnd`    |
| `paddingHorizontal` | `paddingInline`      |
| `paddingVertical`   | `paddingBlock`       |

**Why:** Modern browsers now support standard inline properties, which we
enforce over legacy logical styles.

##### Disallowed: `font`

**Why:** `font` is a shorthand that overrides multiple font settings at once.

**Fix:** Replace with individual font properties. Note: this is autofixable.

- `fontSize`
- `fontFamily`
- `fontStyle`
- `fontWeight`

##### Disallowed: `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`

**Fix:** Replace with individual sub-properties. Note: this is autofixable.

borderWidth borderStyle borderColor

---

##### Disallowed: `animation`

**Fix:** Use explicit longform properties instead:

- `animationName`
- `animationDuration`
- `animationTimingFunction`
- `animationIterationCount`
- `animationDirection`
- `animationFillMode`
- `animationPlayState`

### @stylexjs/sort-keys

This rule helps to sort the StyleX property keys according to
[property priorities](https://github.com/facebook/stylex/blob/main/packages/shared/src/utils/property-priorities.js).
