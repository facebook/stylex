---
sidebar_position: 4
---
# Composing styles across modules

When you define styles, you don’t have to use those styles in the same module. You can also pass them like any other value across modules as props to a custom component.

## Passing Styles to a custom component

```tsx
<CustomComponent xstyle={styles.base} />
```

**NOTE**: Don't use the `stylex` function when passing styles to a custom component. The `stylex` function should only be used to convert one or more style objects into a className string directly on an HTML element.
Here, we used a prop named `xstyle` on a custom component named `CustomComponent`. These names are arbitrary, but we recommend you choose a consistent name for style props in your own codebase. We generally use the name `xstyle` which stands for “external styles”
When passing styles to a Custom Component, you can pass multiple styles or even conditional styles just you would when setting styles on an HTML element. The only difference is that instead of using the `stylex` function, we use an Array literal instead:

```tsx
<CustomComponent xstyle={[styles.base, styles.highlighted]} />
```

```tsx
<CustomComponent xstyle={[
    styles.base,
    props.isHighlighted && styles.highlighted,
]} />
```

## Accepting External Styles as Props

Accepting custom StyleX styles is as simple as accepting any other prop.

```tsx
import stylex from '@stylexjs/runtime';

const styles = stylex.create({
  foo: {/*...*/}
});

function CustomComponent({xstyle}) {
  return <div className={stylex(styles.foo, xstyle)}
}
```

The `xstyle` prop which is passed from another component (example above) may either be a single object or an Array of multiple objects. Luckily, the `stylex` function can handle Arrays of style objects without any further modifications and the code above will *just work*.
In the code example above, the external styles in the `xstyle` prop is passed as the last argument to the `stylex` function. This means that any external styles will override and win over any local styles defined in `styles.foo`. While this is not a requirement of styles, we recommend that you follow this pattern for your own custom components so that you can have predictable behavior when passing styles to custom component.
There may be cases when you don't want to allow overriding certain local styles in your custom component. In such cases, we recommend that you limit the styles that can be passed into your component with Prop Types.
Not only can you accept StyleX style objects as props, the styles are also fully type-safe as you can add type annotations (in Typescript or Flow) to define exactly the styles you accept, which we will see next.
