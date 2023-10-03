// @flow strict

import stylex from '@stylexjs/stylex';
import type {
  StaticStyles,
  StyleXStyles,
  StaticStylesWithout,
  StyleXStylesWithout,
  StyleXClassNameFor,
  InlineStyles,
} from '@stylexjs/stylex/lib/StyleXTypes';

/* eslint-disable no-unused-vars */

/**
 * EMPTY STYLES
 */
const styles1: Readonly<{ foo: Readonly<{ $$css: true }> }> = stylex.create({
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

/**
 * SIMPLE STYLES
 */
const styles2: Readonly<{
  foo: Readonly<{
    $$css: true;
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

/**
 * FALLBACK STYLES
 */
const styles3: Readonly<{
  foo: Readonly<{
    $$css: true;
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

/**
 * CONDITIONAL STYLES
 */
const styles4: Readonly<{
  foo: Readonly<{
    $$css: true;
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

/**
 * NESTED CONDITIONAL STYLES
 */
const styles5: Readonly<{
  foo: Readonly<{
    $$css: true;
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

/**
 * DYNAMIC NESTED CONDITIONAL STYLES
 */
const styles6: Readonly<{
  foo: (mobile: number) => Readonly<
    [
      Readonly<{
        $$css: true;
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
    }) as const, // Typescript limitation
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

/**
 * PSEUDO-ELEMENT STYLES
 */
const styles7: Readonly<{
  foo: Readonly<{
    $$css: true;
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
