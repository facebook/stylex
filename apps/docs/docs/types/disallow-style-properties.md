---
sidebar_position: 2
---
# Disallowing style properties

There are cases where allowing arbitrary styles may be too permissive for your custom component and you want to ensure that certain style properties are never overridden. For example, you may want to disallow overriding layout properties for a custom component in order to ensure that your component continues to work as expected.
For these use cases, you can use the `XStyleWithout<>` type.
```tsx
type Props = {
  ...
  xstyle?: XStyleWithout<{
    postion: unknown,
    top: unknown,
    start: unknown,
    end: unknown,
    bottom: unknown,
    margin: unknown,
    marginBottom: unknown,
    marginEnd: unknown,
    marginStart: unknown,
    marginTop: unknown,
    padding: unknown,
    paddingBottom: unknown,
    paddingEnd: unknown,
    paddingStart: unknown,
    paddingTop: unknown,
    width: unknown,
    height: unknown,
    flexBasis: unkown,
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
