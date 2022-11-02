---
sidebar_position: 4
---

# Media Queries And Pseudo Classes

:::note

There is an [RFC to change the way we handle Media Queries and Pseudo Classes](/blog) for better predictability and improved types.

:::

## Pseudo Classes

Pseudo Classes can be nested within style definitions, similar to how they work tools such Sass and other CSS-in-JS libraries.

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  button: {
    color: 'var(--blue-link)',
    ':hover': {
      transform: 'scale(1.1)',
    },
    ':active': {
      transform: 'scale(0.9)',
    },
  },
});
```

And you can use the styles as usual:

```tsx
<button className={stylex(styles.button)} />
```

## Media Queries

Media Queries can, similarly, be nested within style definitions.

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  base: {
    width: 800,
    '@media (max-width: 800)': {
      width: '100%',
    },
  },
});
```

Using styles remains the same

```tsx
<div className={stylex(styles.base)} />
```
