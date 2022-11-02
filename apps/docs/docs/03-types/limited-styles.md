---
sidebar_position: 3
---

# Accepting a limited set of styles

When you want to accept external styles, but not arbitrary styles, it might make sense to create an allow list for the styles properties (and values) that can be accepted. To do this, you can simply use the `XStyle<{...}>` type with a type argument.

## Accepting from a set of style properties

Say you wanted to accept styles that allowed changing the colors of the component but nothing else, you could write types that looked like this:

```tsx
type Props = {
  // ...
  xstyle?: XStyle<{
    color?: StyleXClassName,
    backgroundColor?: StyleXClassName,
    borderColor?: StyleXClassName,
    borderTopColor?: StyleXClassName,
    borderEndColor?: StyleXClassName,
    borderBottomColor?: StyleXClassName,
    borderStartColor?: StyleXClassName,
  }>,
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

Now, the `xstyle` prop will accept only the properties that you have defined but disallow anything else.

:::note

It is usually a good practice to make the keys of the style types optional. However, there might be situations where you can require some styles to be passed in.

:::

## Limiting the possible values for Styles

While it's useful to limit what style properties can be passed in, sometimes it makes sense to go a step further and limit the possible values for those styles too. For example, if your component wants to accept `marginTop` but only accept one of `0`, `4`, or `8` pixels as values, you can do that too!

```tsx
type Props = {
  ...
  xstyle?: XStyle<{
    marginTop: StyleXClassNameForValue<0 | 4 | 8>
  }>,
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

With the `StyleXClassNameForValue<>` type you can pass in a type argument with a union of literal types that provide the set of possible values that the style property can have.
