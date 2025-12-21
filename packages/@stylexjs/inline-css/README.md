# @stylexjs/inline-css

Compile-time helpers that let you author StyleX styles with raw CSS properties:

```js
import * as stylex from '@stylexjs/stylex';
import * as css from '@stylexjs/inline-css';

function Example({ color }) {
  return (
    <div
      {...stylex.props(
        css.display.flex,
        css.flexDirection.column,
        css.padding._16px,
        css.width['calc(100% - 20cqi)'],
        css.color[color],
      )}
    />
  );
}
```

The bindings exported here are compile-time only. The StyleX Babel plugin
detects property/value member expressions like `css.display.flex` and compiles
them to class names with the corresponding CSS injected. At runtime, accessing
these bindings directly will throw – make sure your code is built with the
StyleX compiler enabled.

