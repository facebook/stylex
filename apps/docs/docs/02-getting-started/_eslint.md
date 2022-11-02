---
title: ESLint Rules for stylex
date: Last Modified
permalink: /docs/eslint-rules-for-stylex.html
eleventyNavigation:
  key: ESLint Rules 
  order: 0
---

{% import "fragments/macros.html" as macro with context %}

:::lead
Stylex has a few limitations that allow it to be performant, enabling the ESLint rules will help guide you and other engineers from making mistakes that could prevent stylex from working properly.
:::


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

## List of the rules

### `stylex/valid-styles`

Stylex requires styles that are statically analyzable. This rule will detect invalid styles that stylex cannot handle.

