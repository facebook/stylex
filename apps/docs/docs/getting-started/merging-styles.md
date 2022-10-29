---
sidebar_position: 3
---
# Merging styles

As seen previously, you can use the `stylex` function to convert a style object to a className string that can be used directly in your markup. However, `stylex` function is more powerful than that and can be used to merge multiple styles deterministically and based on the usage order.
A simple way to think about the `stylex` function is that it does what `Object.assign` does. It merges many objects and the later objects have precedence over previous objects.
Consider that a couple of style objects are defined as so:

```tsx
import stylex from '@stylexjs/runtime';

const styles = stylex.create({
  base: {
    fontSize: 16,
    lineHeight: 1.5,
    color: 'rgb(60,60,60)',
  },
  highlighted: {
    color: 'rebeccapurple'
  }
});
```

You can use the result of merging both style objects like so:

```tsx
<div className={stylex(styles.base, styles.highlighted)} />
```

Here, it is important to note that the last argument to the `stylex` function will always win. The order in which the styles are defined does not matter, only the order in which they are passed to the `stylex` function.
In the example above, the resolved `color` of the div will be "rebeccapurple" simply becomes `styles.highlighted` comes after `styles.base` in the argument list of the `stylex` function.

## Conditional styles

The `stylex` function can also ignore falsy values such as `null`, `undefined` or `false`. This ability can be used when you need to apply some styles conditionally.

```tsx
<div className={stylex(
    styles.base,
    props.isHighlighted && styles.highlighted
)}/>
```

When using styles conditionally, you can use ternary expressions, or the `&&` operator.
Again, when in doubt, remember that the `stylex` function does what `Object.assign` or object-spread syntax would do.
