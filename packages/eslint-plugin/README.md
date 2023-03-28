# ESLint Plugin for stylex

The ESLint rule is a standalone ESLint plugin that mostly maintains an `allowlist` for valid styles and their valid values.

This was originally created from Flow types which is why it's currently not very powerful.

## Installing the plugin

`$ npm i eslint-plugin-stylex --save-dev`

## Enabling the plugin and rules

Once you've installed the npm package you can enable the plugin and rules by opening your ESLint configuration file and adding the plugin and rules.

``` json
{
  "rules": {
    "stylex/valid-styles": "error"
  },
  "plugins": ["stylex"]
}
```

## All the rules

### stylex/valid-styles

Stylex requires styles that are statically analyzable. This rule will detect invalid styles that stylex cannot handle.
