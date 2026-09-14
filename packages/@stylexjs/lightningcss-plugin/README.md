# @stylexjs/lightningcss-plugin

Simplify generated media and supports conditions using the same condition logic
as the StyleX compiler. Run this **after** `processStylexRules` has resolved
`defineConsts` values.

```js
import stylexPlugin from '@stylexjs/babel-plugin';
import { simplifyConditions } from '@stylexjs/lightningcss-plugin';

const css = stylexPlugin.processStylexRules(collectedRules);
const result = simplifyConditions({
  filename: 'stylex.css',
  code: Buffer.from(css),
  minify: true,
  sourceMap: true,
});
```

To integrate with an existing Lightning CSS transform, pass
`createConditionVisitor()` as `visitor`, or combine it with other visitors using
Lightning CSS's `composeVisitors`.

The visitor simplifies boolean groups, contradictory conditions, overlapping
width/height intervals, and nested media queries. It retains the compiler's
±0.01 range approximation. Unknown features and incompatible units remain
opaque. Expansion is bounded; expressions that would grow excessively remain
unsimplified. Container query boundaries and feature sets are preserved because
changing them can select a different ancestor.

`enableMediaQueryOrder` still controls regular-style ordering in the Babel
plugin. With that option enabled, whole at-rule keys imported from `defineConsts`
are resolved before their exclusions are emitted. This package then simplifies
the resulting CSS. Turning ordering off does not create exclusions; this visitor
only simplifies the conditions it receives.
