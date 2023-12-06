/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import stylex from '@stylexjs/stylex';
import type {
  StaticStyles,
  StyleXStyles,
  StaticStylesWithout,
  StyleXStylesWithout,
} from '@stylexjs/stylex';
import type {
  StyleXClassNameFor,
  InlineStyles,
  StyleXVar,
} from '@stylexjs/stylex/lib/StyleXTypes';

/* eslint-disable no-unused-vars */

/**
 * EMPTY STYLES
 */
const styles1: Readonly<{ foo: Readonly<{}> }> = stylex.create({
  foo: {},
});
styles1.foo as StaticStyles;
styles1.foo as StaticStyles<{}>;
styles1.foo as StaticStyles<{ width?: number | string }>;
styles1.foo as StaticStyles<{ width?: unknown }>;
styles1.foo as StaticStylesWithout<{ width: unknown }>;
styles1.foo as StyleXStyles;
styles1.foo as StyleXStyles<{}>;
styles1.foo as StyleXStyles<{ width?: number | string }>;
styles1.foo as StyleXStyles<{ width?: unknown }>;
styles1.foo as StyleXStylesWithout<{ width: unknown }>;

stylex(styles1.foo);
stylex.props(styles1.foo);

/**
 * SIMPLE STYLES
 */
const styles2: Readonly<{
  foo: Readonly<{
    width: StyleXClassNameFor<'width', '100%'>;
  }>;
}> = stylex.create({
  foo: {
    width: '100%',
  },
});
styles2.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles2.foo satisfies StaticStyles<{}>;
styles2.foo satisfies StaticStyles<{ width: '100%' }>;
styles2.foo satisfies StaticStyles<{ width: unknown }>;
styles2.foo satisfies StaticStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `width`
styles2.foo satisfies StaticStylesWithout<{ width: unknown }>;
// @ts-expect-error - 'number' is not assignable to '100%'.
styles2.foo satisfies StaticStyles<{ width: 100 }>;
styles2.foo satisfies StaticStyles<{ width: number | string }>;
styles2.foo satisfies StaticStyles<{ width?: unknown; height?: string }>;
styles2.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles2.foo satisfies StyleXStyles<{}>;
styles2.foo satisfies StyleXStyles<{ width: '100%' }>;
styles2.foo satisfies StyleXStyles<{ width: number | string }>;
styles2.foo satisfies StyleXStyles<{ width?: unknown }>;
styles2.foo satisfies StyleXStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `width`
styles2.foo satisfies StyleXStylesWithout<{ width: unknown }>;

stylex(styles2.foo);
stylex.props(styles2.foo);

/**
 * FALLBACK STYLES
 */
const styles3: Readonly<{
  foo: Readonly<{
    width: StyleXClassNameFor<'width', '100%' | '200%'>;
  }>;
}> = stylex.create({
  foo: {
    width: stylex.firstThatWorks('100%', '200%'),
  },
});
styles3.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles3.foo satisfies StaticStyles<{}>;
styles3.foo satisfies StaticStyles<{ width: '100%' | '200%' }>;
styles3.foo satisfies StaticStyles<{ width: number | string }>;
styles3.foo satisfies StaticStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `width`
styles3.foo satisfies StaticStylesWithout<{ width: unknown }>;
styles3.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles3.foo satisfies StyleXStyles<{}>;
styles3.foo satisfies StyleXStyles<{ width: '100%' | '200%' }>;
styles3.foo satisfies StyleXStyles<{ width: number | string }>;
styles3.foo satisfies StyleXStyles<{ width?: unknown }>;
styles3.foo satisfies StyleXStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `width`
styles3.foo satisfies StyleXStylesWithout<{ width: unknown }>;

stylex(styles3.foo);
stylex.props(styles3.foo);

/**
 * CONDITIONAL STYLES
 */
const styles4: Readonly<{
  foo: Readonly<{
    width: StyleXClassNameFor<'width', '100%' | '100dvw'>;
  }>;
}> = stylex.create({
  foo: {
    width: {
      default: '100%',
      '@supports (width: 100dvw)': '100dvw',
    },
  },
});
styles4.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles4.foo satisfies StaticStyles<{}>;
styles4.foo satisfies StaticStyles<{ width: '100%' | '100dvw' }>;
styles4.foo satisfies StaticStyles<{ width: number | string }>;
styles4.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles4.foo satisfies StyleXStyles<{}>;
styles4.foo satisfies StyleXStyles<{ width: '100%' | '100dvw' }>;
styles4.foo satisfies StyleXStyles<{ width: number | string }>;
styles4.foo satisfies StyleXStyles<{ width?: unknown }>;

stylex(styles4.foo);
stylex.props(styles4.foo);

/**
 * NESTED CONDITIONAL STYLES
 */
const styles5: Readonly<{
  foo: Readonly<{
    width: StyleXClassNameFor<'width', '100%' | '100dvw' | '200%'>;
  }>;
}> = stylex.create({
  foo: {
    width: {
      default: '100%',
      '@supports (width: 100dvw)': {
        default: '100dvw',
        '@media (max-width: 1000px)': '200%',
      },
    },
  },
});
styles5.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles5.foo satisfies StaticStyles<{}>;
styles5.foo satisfies StaticStyles<{ width: '100%' | '100dvw' | '200%' }>;
styles5.foo satisfies StaticStyles<{ width: number | string }>;
styles5.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles5.foo satisfies StyleXStyles<{}>;
styles5.foo satisfies StyleXStyles<{ width: '100%' | '100dvw' | '200%' }>;
styles5.foo satisfies StyleXStyles<{ width: number | string }>;
styles5.foo satisfies StyleXStyles<{ width?: unknown }>;

stylex(styles5.foo);
stylex.props(styles5.foo);

/**
 * DYNAMIC NESTED CONDITIONAL STYLES
 */
const styles6: Readonly<{
  foo: (mobile: number) => Readonly<
    [
      Readonly<{
        width: StyleXClassNameFor<'width', '100%' | '100dvw' | number>;
      }>,
      InlineStyles,
    ]
  >;
}> = stylex.create({
  foo: (mobile: number) =>
    ({
      width: {
        default: '100%',
        '@supports (width: 100dvw)': {
          default: '100dvw',
          '@media (max-width: 1000px)': mobile,
        },
      },
    }) as const, // TypeScript limitation
});
// @ts-expect-error - Functions don't return static styles.
styles6.foo(100) satisfies StaticStyles;
// @ts-expect-error - Functions don't return static styles.
styles6.foo(100) satisfies StaticStyles<{}>;
// @ts-expect-error - Functions don't return static styles.
styles6.foo(100) satisfies StaticStyles<{ width: '100%' | '100dvw' | number }>;
// @ts-expect-error - Functions don't return static styles.
styles6.foo(100) satisfies StaticStyles<{ width: number | string }>;
// Functions return StyleXStyles!
styles6.foo(100) satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles6.foo(100) satisfies StyleXStyles<{}>;
styles6.foo(100) satisfies StyleXStyles<{ width: '100%' | '100dvw' | number }>;
styles6.foo(100) satisfies StyleXStyles<{ width: number | string }>;
styles6.foo(100) satisfies StyleXStyles<{ width?: unknown }>;

// @ts-expect-error - `stylex()` can't accept dynamic styles.
stylex(styles6.foo(100));

stylex(styles6.foo(100)[0]);
stylex.props(styles6.foo(100));

/**
 * PSEUDO-ELEMENT STYLES
 */
const styles7: Readonly<{
  foo: Readonly<{
    '::before': StyleXClassNameFor<
      '::before',
      Readonly<{
        width: '100%';
      }>
    >;
  }>;
}> = stylex.create({
  foo: {
    '::before': { width: '100%' },
  },
});
styles7.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles7.foo satisfies StaticStyles<{}>;
styles7.foo satisfies StaticStyles<{ '::before': { width: '100%' } }>;
styles7.foo satisfies StaticStyles<{
  '::before': { width: number | string; height?: unknown };
}>;
styles7.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles7.foo satisfies StyleXStyles<{}>;
styles7.foo satisfies StyleXStyles<{ '::before': { width: '100%' } }>;
styles7.foo satisfies StyleXStyles<{
  '::before': { width: number | string; height?: unknown };
}>;

stylex(styles7.foo);
stylex.props(styles7.foo);

// CSS variables

const vars = stylex.defineVars({
  accent: 'red' as const,
});

const styles8: Readonly<{
  foo: Readonly<{
    color: StyleXClassNameFor<'color', 'red'>;
  }>;
}> = stylex.create({
  foo: {
    // In a real example `vars` would be imported from another file.
    // eslint-disable-next-line @stylexjs/valid-styles
    color: vars.accent,
  },
});

vars.accent satisfies StyleXVar<'red'>;

// @ts-expect-error - We want to disallow extra keys
vars.accent satisfies StyleXVar<'blue'>;

styles8.foo satisfies StaticStyles;
// @ts-expect-error - We want to disallow extra keys
styles8.foo satisfies StaticStyles<{}>;
styles8.foo satisfies StaticStyles<{ color: 'red' }>;
styles8.foo satisfies StaticStyles<{ color: unknown }>;
styles8.foo satisfies StaticStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `width`
styles8.foo satisfies StaticStylesWithout<{ color: unknown }>;
// @ts-expect-error - 'number' is not assignable to 'red'.
styles8.foo satisfies StaticStyles<{ color: 100 }>;
// @ts-expect-error - 'blue' is not assignable to 'red'.
styles8.foo satisfies StaticStyles<{ color: 'blue' }>;
styles8.foo satisfies StaticStyles<{ color: number | string }>;
styles8.foo satisfies StaticStyles<{ color?: unknown; height?: string }>;
styles8.foo satisfies StyleXStyles;
// @ts-expect-error - We want to disallow extra keys
styles8.foo satisfies StyleXStyles<{}>;
styles8.foo satisfies StyleXStyles<{ color: 'red' }>;
styles8.foo satisfies StyleXStyles<{ color: number | string }>;
styles8.foo satisfies StyleXStyles<{ color?: unknown }>;
styles8.foo satisfies StyleXStylesWithout<{ height: unknown }>;
// @ts-expect-error - The style does have `color`
styles8.foo satisfies StyleXStylesWithout<{ color: unknown }>;

stylex(styles8.foo);
stylex.props(styles8.foo);
