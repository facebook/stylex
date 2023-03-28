# @stylexjs/stylex

## Installation

To start playing with StyleX without having to set up any build settings you can install just two packages:

```sh
npm install --save @stylexjs/stylex
```

### Compiler

StyleX is designed to extract styles to a static CSS style sheet during an app's build process. StyleX provides a Babel plugin along with plugin integrations for Webpack, Rollup and NextJS.

```sh
npm install --save-dev @stylexjs/babel-plugin
```

For more information on working with the compiler, please see the documentation for [`@stylexjs/babel-plugin`](https://www.npmjs.com/package/@stylexjs/babel-plugin).

### Runtime compiler

The runtime compiler should only be used for development and testing purposes.

```sh
npm install --save-dev @stylexjs/dev-runtime
```

Import `@stylexjs/dev-runtime` in your JS entry-point to set everything up.

```ts
import inject from '@stylexjs/dev-runtime';

if (process.env.NODE_ENV !== 'production') {
  inject({
    // configuration options
    classNamePrefix: 'x-',
    dev: true,
    test: false,
  });
}
```

For more information on working with the compiler, please see the documentation for [`@stylexjs/dev-runtime`](https://www.npmjs.com/package/@stylexjs/dev-runtime).

## API

### stylex.create()

Styles are defined as a map of CSS rules using `stylex.create()`. In the example below, there are 2 different CSS rules. The names "root" and "highlighted" are arbitrary names given to the rules.

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'rgb(60,60,60)',
  },
  highlighted: {
    color: 'yellow',
  }
});
```

Pseudo-classes and Media Queries can be nested within style definitions:

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'rgb(60,60,60)',
    '@media (min-width: 800px)': {
      maxWidth: '800px',
    },
  },
  highlighted: {
    color: 'yellow',
    ':hover': {
      opacity: '0.9',
    }
  }
});
```

The compiler will extract the rules to CSS and replace the rules in the source code with a "compiled style" object.

### stylex.apply()

Applying style rules to specific elements is done using `stylex.apply()`. Each argument to this function must be a reference to a compiled style object, or an array of compiled style objects. The function merges styles from left to right.

```tsx
<div {...stylex.apply(styles.root, styles.highlighted)} />
```

The `stylex.apply` function returns React DOM style props as required to render an HTML element. StyleX styles can still be passed to other components via props, but only the components rendering HTML elements will use `stylex.apply()`. For example:

```tsx
const styles = stylex.create({
  internalRoot: {
    padding: 10
  },
  exportedRoot: {
    position: 'relative'
  }
});

function InternalComponent(props) {
  return <div {...props} {...stylex.apply([ styles.internalRoot, props.style ])} />
}

export function ExportedComponent(props) {
  return <InternalComponent style={[ styles.exportedRoot, props.style ]} />
}
```

Styles can be conditionally included using standard JavaScript.

```tsx
<div {...stylex.apply(styles.root, isHighlighted && styles.highlighted)} />
```

And the local merging of styles can be used to control the relative priority of rules. For example, to allow a component's local styles to take priority over style property values passed in via props.

```tsx
<div {...stylex.apply(props.style, styles.root)} />
```

You can even mix compiled styles with inline styles

```tsx
<div {...stylex.apply(styles.root, { opacity })} />
```

### stylex.firstThatWorks()

Defining fallback styles is done with `stylex.firstThatWorks()`. This is useful for engines that may not support a specific style property.

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  header: {
    position: stylex.firstThatWorks('sticky', '-webkit-sticky', 'fixed'),
  },
});
```

This is equivalent to defining CSS as follows:

```css
.header {
  position: fixed;
  position: -webkit-sticky;
  position: sticky;
}
```
