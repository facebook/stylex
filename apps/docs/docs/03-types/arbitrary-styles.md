---
sidebar_position: 1
---
# Accepting arbitrary styles

StyleX comes with full support for Static Types. Apart from having to use a few helper types, the type definitions should feel no different from types used for simple inline style objects.
The most common type you might need to use is called `XStyle<>`. This lets you accept an object of arbitrary StyleX styles.

```tsx
type Props = {
  ...
  xstyle?: XStyle<>,
};

function MyComponent({xstyle, ...}: Props) {
  return (
    <div
      className={stylex(localStyles.foo, localStyles.bar, xstyle)}
    >
      {/* ... */}
    </div>
  );
}
```

Since `xstyle` is just a regular prop, you can use an arbitrary name for it and you can use multiple props if you want to be able accept styles for multiple HTML elements within your component.

## Recommendations

### Use prop names that follow the pattern of `xstyle` or `fooXStyle`

We recommend using the prop name `xstyle` for the canonical HTML element of your component and the pattern of `*XStyle` for other externals that you accept for your component. This will lead to a consistent pattern among components that use StyleX and will make usage of stylex within components more predictable.

### Use `xstyle` as the last argument to `stylex()` when using it

We recommend ensuring that any styles that are passed in as props externally override any local styles that you may have set on your custom component. This will gives users of your component a more predictable behaviour when passing styles in.
There may, however, be situations where you don't want certain local styles to ever be overridden. In those cases we suggest using type to block certain styles from being passed.
