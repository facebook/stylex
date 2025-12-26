# @stylexjs/inline-css

Compile-time helpers for authoring StyleX styles inline inside stylex.props().

This package exposes CSS properties as a namespaced object and lets you express
static and dynamic styles using normal JavaScript syntax. There is no new
runtime styling system and no design tokens — everything compiles to the same
output as stylex.create.

The compiler treats inline styles from this package as if they were authored
locally, enabling the same optimizations as normal StyleX styles.

## Usage

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
        css.color(color),
      )}
    />
  );
}
```

### Static values

Static styles are expressed via property access and are fully resolved at
compile time.

```js
css.display.flex;
css.flexDirection.column;
```

#### Values starting with numbers

Use a leading underscore for values that begin with a number. The underscore is
ignored by the compiler and has no semantic meaning.

```js
css.padding._16px;
css.fontSize._1rem;
```

### Complex literal values

For values that are not valid JavaScript identifiers (for example, values that
contain spaces or symbols), use computed property syntax.

```js
css.fontSize['1.25rem'];
css.width['calc(100% - 20cqi)'];
css.gridTemplateColumns['1fr minmax(0, 3fr)'];
```

### Dynamic values

Dynamic styles use call syntax and should be used sparingly.

```js
css.color(color);
css.marginLeft(offset);
```
