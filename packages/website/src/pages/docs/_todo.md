### Example

```javascript
import stylex from 'stylex';

const styles = stylex.create({
  default: {
    backgroundColor: 'var(--primary-button-background)',
    color: 'var(--primary-text)',
    padding: 5,
    // Pseudo classes
    ':hover': {
      color: 'purple',
    },
  },

  active: {
    backgroundColor: 'var(--primary-button-pressed)',
    // Media queries
    '@media (min-width:500px)': {
      padding: 10,
    },
  },
});

// Creating a single class
<div className={stylex(styles.default)} />

// Composing classes
// unlike regular CSS, the later argument to stylex() always "wins"
// `active` styles are applied
<div className={stylex(styles.default, styles.active)} />
// `default` styles are applied
<div className={stylex(styles.active, styles.default)} />

// Composes classes conditionally
// unlike regular CSS, the later argument to stylex() always "wins"
<div className={stylex(
  styles.default,
  isActive && styles.active
)} />
```

## Features

### Namespaces

Stylex uses namespaces to allow multiple styles to be declared in a single declaration. This is represented with nested objects.

In the following example we create 2 namespaces, `red` and `green`.

```javascript
const styles = stylex.create({
  red: {
    backgroundColor: 'red',
  },

  green: {
    backgroundColor: 'green',
  },
});

...

// unlike regular CSS, the later argument to stylex() always "wins"
// `green` is applied
<div className={stylex(styles.red, styles.green)} />
// `red` is applied
<div className={stylex(styles.green, styles.red)} />

```

### Creating CSS classes

The return value of a `stylex.create()` call is a factory to generate class names. This is purposely similar (but not identical) to `StyleSheet.create` from React Native.

For the examples in the rest of this section we're going to use the following `stylex.create()` call:

```javascript
const styles = stylex.create({
  default: {
    backgroundColor: 'blue',
  },
  
  active: {
    backgroundColor: 'red',
  },
});
```

### Strings

Style values specified as strings are treated as-is without any post processing. For example, if you write:

```
const styles = stylex.create({
  default: {
    width: 'foobar',
  },
});
```

Then we'll generate the CSS `width: foobar;` The `stylex-valid-styles` ESlint won't usually validate these strings, but the linting should improve over time.

### Numbers

stylex allows you to omit units from any property that accepts numbers.

There are 3 different ways that this is handled.

1. For unitless properties like `font-weight` and others, then no unit is appended.
2. For timing related properties such as `transition-delay` and others, `ms` is appended.
3. For everything else we append `px`.

### Pseudo Selectors

NOTE: In most cases, you should not be using pseudo classes to style interactions and should instead be using events. We use slightly different heuristics than the browser to decide hover/focus/active states and CSS pseudo selectors will fall back to the browser behavior.

Pseudo selectors can be represented as a child object of a namespace. Pseudo selector objects cannot have other pseudo selectors nested inside of them.

An allowlist exists to limit the usage of pseudo selectors to only a select few. See the [[#pseudo-selector-allowlis | pseudo selector allowlist]] section for more information.

```
const styles = stylex.create({
  namespace: {
    color: 'blue',
    ':hover': {
      color: 'purple',
    },
  },
});
```

### Media Queries

Media queries can be represented the same as a pseudo selector. However, you should think twice before using Media Queries on Comet. We're still finalising the final list of breakpoints, and you can often achieve responsive layouts with just FlexBox instead of Media Queries.

```
const styles = stylex.create({
  namespace: {
    color: 'blue',
    '@media only screen and (max-width : 320px)': {
      color: 'purple',
    },
  },
});
```

General Guidelines for now are:
1. Your media query should always have both `min-width` **and** a `max-width`.
2. The only exception to the rule above is for the smallest breakpoint where, you can omit the `min-width: 0px`
3. **Yes**, this is opposite of what is recommended as "mobile-first" design. This is for two reasons:
    - Comet is built for desktop first, and most of the default styles are *not* optimized for mobile.
    - This way every media query has a knowable min and max width, opening up the possibility for better tooling in the future.

WARNING: Avoid writing media queries which have overlapping ranges! The orders the selectors appear in the stylesheet might not be always the same and if the specificity of these selectors will be the same, the winning style cannot be determined reliably.

### Keyframes

NOTE: the `animation` shorthand is not allowed. You must use `animationName`, `animationDuration` etc.

The `stylex.keyframes` API allows you to create keyframe rules. A keyframe name will be returned which can be interpolated with `animationXxx` properties.

```
const name = stylex.keyframes({
  '0%': {
    backgroundColor: 'red',
  },
  '50%': {
    backgroundColor: 'green',
  },
  '100%': {
    backgroundColor: 'blue',
  },
});

const styles = stylex.create({
  default: {
    animationName: name,
    animationDuration: '2s',
  },
});
```

### Validation

Hence, Stylex uses a combination of ESlint and Flow to validate different aspects of your styles.

We use an [Eslint rule](https://www.internalfb.com/intern/wiki/Eslint/stylex-valid-styles/) to validate your `stylex.create` calls. This lint rule was generated from Flow types that were used previously and may miss some errors. We hope to keep improving this over time. If you find a style that is missing and should be supported please post on the Stylex Support group.

On the other hand, when style composition is used, Flow is used to validate that correct values are passed between components. 

## Restrictions

In order to optimize and compile away styles, some restrictions need to be imposed.

### Only pure values

Values used inside of `stylex` must be pure. Style values are restricted to arrays, numbers, and strings. This means, any references to variables must be in the file themselves, and must not reference any dynamic values.

Examples of **allowed** syntax are:

```javascript
const marginVar = 5;
const defaultRadius = 2;

stylex.create({
  default: {
    borderRadius: defaultRadius * 2,
    backgroundColor: 'red',
    padding: 5,
    margin: marginVar,
    boxShadow: [
      '3px 3px red',
      '-1em 0 0.4em olive',
    ],
  },
});
```

Examples of **illegal** syntax are:

```javascript
import {BORDER} from 'constants';

stylex.create({
  default: {
    // You cannot refer to external values
    border: BORDER,
    // You cannot call functions
    backgroundColor: generateBackgroundColor(),
  },
});
```

### Composition

When you do need to compose styles across module boundaries, all your styles must be wrapped in a `stylex.create` call **BEFORE** being exported.

For example, the illegal usage above, could instead be written as:

```
import {borderStyle, backgroundColorStyle} from 'constants';

<div className={stylex(borderStyle, backgroundColorStyle)} />
```
Where `constants.js` would looks like this:
```js
const styles = stylex.create({
  borderStyles: {
    border: '1px solid black',
  },
  backgroundColorStyles: {
    backgroundColor: 'var(--card-background)',
  },
});
```

#### Passing styles down as props.

Similar to the example above, you can pass down styles to a component as props to be used for composition:


```
const styles = stylex.create({default: {...}})

<CustomComponent xstyle={styles.default} />
```

Where the `CustomComponent` would look like this:
```
import type {XStyle} from 'CometStyleXTypes';

const styles = stylex.create({local: {...}})

type Props = $ReadOnly<{
  xstyle: XStyle<>,
}>;
function CustomComponent({xstyle}: Props) {
  return <div className={stylex(styles.local, xstyle)} />
}
```
NOTE: We have settled on a convention to use `xstyle` as the name of the prop for passing styles to a component. You should follow this convention except when your component needs multiple props to style different elements in your component, in which case you should use names such as as `parentXStyle`, `childXStyle` and so on.

NOTE: The type XStyle takes a type argument. If you skip it, it falls back to a predefined list of style properties. XStyle will automatically extend your type argument to be an object or an array of objects where the array also allows falsy values such as `false`, `null` and `undefined` so that styles can be passed in conditionally. It is recommended that you wrap all types for `xstyle` in `XStyle<...>`.

#### Flow Types for xstyle

**Arbitrary Styles**

As you saw in the example above, when you need unconstrained, arbitrary styles for your component, you can use the type `XStyle`.
```
type Props = $ReadOnly<{
  xstyle: XStyle<>,
}>;
```

**Styles For Specific Properties**

When you want the user of your component to only be able to pass in styles for a white list of CSS properties, you can use the `StyleXClassName` type. For example, for a component where you only want margin styles to be passed in and nothing else.

```
type Props = $ReadOnly<{
  xstyle: XStyle<$ReadOnly<{
    marginStart?: StyleXClassName,
    marginEnd?: StyleXClassName,
    marginTop?: StyleXClassName,
    marginBottom?: StyleXClassName,
  }>>,
}>;
```

Here any, user that tries to pass in any styles other than for margins will get a Flow error.

**Specific Styles For Specific Properties**

You can even go one step further and constrain the styles to only accept styles with certain values with the `StyleXClassNameForValue<...>` type.

```
type Props = $ReadOnly<{
  xstyle: XStyle<$ReadOnly<{
    marginBottom?: StyleXClassNameForValue<0 | 4 | 8 | 12>,
    marginEnd?: StyleXClassNameForValue<0 | 4 | 8 | 12>,
    marginStart?: StyleXClassNameForValue<0 | 4 | 8 | 12>,
    marginTop: StyleXClassNameForValue<0 | 4 | 8 | 12>,
  }>>,
}>;
```

### Pseudo selector allowlist

Only media queries, `:hover`, `:active` and `:focus` are allowed as pseudo selectors.

Sibling and child selectors such as `.foo > .bar` or `.foo ~ .bar` etc break encapsulation and are considered an anti-pattern. When using a component, no other components on the page should influence its styling.

Since we're using Atomic CSS, each additional pseudo selector bloats the size of the stylesheet as we need to generate a new rule for it. In the future we may loosen this restriction.
