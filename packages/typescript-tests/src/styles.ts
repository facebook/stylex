/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

const vars = stylex.defineVars({
  bar: '100%',
  baz: stylex.types.lengthPercentage('100%'),
} as const);

const styles = stylex.create({
  basic: {
    width: '100%',
  },
  dynamicWithStringParam: (foo: string) =>
    ({
      width: foo,
    }) as const,
  dynamicWithNumericParam: (foo: number) =>
    ({
      width: foo,
    }) as const,
  vars: {
    width: vars.bar,
  },
  typedVars: {
    width: vars.baz,
  },
  empty: {},
  multipleProperties: {
    width: '100%',
    height: '100%',
  },
  pseudoElement: {
    '::before': {
      width: '100%',
    },
  },
  pseudoClass: {
    width: {
      ':hover': '100%',
      default: '100%',
    },
  },
  mediaQuery: {
    width: {
      '@media (min-width: 1024px)': '100%',
      default: '100%',
    },
  },
  combinedConditions: {
    width: {
      default: '100%',
      ':hover': {
        default: '100%',
        '@media (hover: hover)': '100%',
      },
    },
  },
});

styles.basic satisfies stylex.StyleXStyles;
styles.dynamicWithStringParam('100%') satisfies stylex.StyleXStyles;
styles.dynamicWithNumericParam(100) satisfies stylex.StyleXStyles;
styles.vars satisfies stylex.StyleXStyles;
styles.typedVars satisfies stylex.StyleXStyles;
styles.empty satisfies stylex.StyleXStyles;
styles.multipleProperties satisfies stylex.StyleXStyles;
styles.pseudoElement satisfies stylex.StyleXStyles;
styles.pseudoClass satisfies stylex.StyleXStyles;
styles.mediaQuery satisfies stylex.StyleXStyles;
styles.combinedConditions satisfies stylex.StyleXStyles;

[
  styles.basic,
  styles.dynamicWithStringParam('100%'),
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  styles.empty,
  styles.multipleProperties,
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStyles;

[
  // @ts-expect-error - should disallow extra properties
  styles.basic,
  // @ts-expect-error - should disallow extra properties
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should disallow extra properties
  styles.dynamicWithNumericParam(100),
  // @ts-expect-error - should disallow extra properties
  styles.vars,
  // @ts-expect-error - should disallow extra properties
  styles.typedVars,
  styles.empty,
  // @ts-expect-error - should disallow extra properties
  styles.multipleProperties,
  // @ts-expect-error - should disallow extra properties
  styles.pseudoElement,
  // @ts-expect-error - should disallow extra properties
  styles.pseudoClass,
  // @ts-expect-error - should disallow extra properties
  styles.mediaQuery,
  // @ts-expect-error - should disallow extra properties
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{}>;

[
  styles.basic,
  styles.dynamicWithStringParam('100%'),
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  // @ts-expect-error - should require specified property
  styles.empty,
  // @ts-expect-error - should disallow extra properties
  styles.multipleProperties,
  // @ts-expect-error - should disallow pseudo element
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{ width: unknown }>;

[
  styles.basic,
  // @ts-expect-error - should disallow wider values
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should disallow different values
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  // @ts-expect-error - should require specified property
  styles.empty,
  // @ts-expect-error - should disallow extra properties
  styles.multipleProperties,
  // @ts-expect-error - should disallow pseudo element
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{ width: '100%' }>;

[
  styles.basic,
  styles.dynamicWithStringParam('100%'),
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  // @ts-expect-error - should require specified property
  styles.empty,
  styles.multipleProperties,
  // @ts-expect-error - should disallow pseudo element
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{ width: unknown; height?: unknown }>;

[
  // @ts-expect-error - should require specified property
  styles.basic,
  // @ts-expect-error - should require specified property
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should require specified property
  styles.dynamicWithNumericParam(100),
  // @ts-expect-error - should require specified property
  styles.vars,
  // @ts-expect-error - should require specified property
  styles.typedVars,
  // @ts-expect-error - should require specified property
  styles.empty,
  // @ts-expect-error - should disallow extra properties
  styles.multipleProperties,
  // @ts-expect-error - should disallow pseudo element
  styles.pseudoElement,
  // @ts-expect-error - should require specified property
  styles.pseudoClass,
  // @ts-expect-error - should require specified property
  styles.mediaQuery,
  // @ts-expect-error - should require specified property
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{ height: unknown }>;

[
  // @ts-expect-error - should disallow non pseudo element
  styles.basic,
  // @ts-expect-error - should disallow non pseudo element
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should disallow non pseudo element
  styles.dynamicWithNumericParam(100),
  // @ts-expect-error - should disallow non pseudo element
  styles.vars,
  // @ts-expect-error - should disallow non pseudo element
  styles.typedVars,
  // @ts-expect-error - should disallow non pseudo element
  styles.empty,
  // @ts-expect-error - should disallow non pseudo element
  styles.multipleProperties,
  styles.pseudoElement,
  // @ts-expect-error - should disallow non pseudo element
  styles.pseudoClass,
  // @ts-expect-error - should disallow non pseudo element
  styles.mediaQuery,
  // @ts-expect-error - should disallow non pseudo element
  styles.combinedConditions,
] satisfies stylex.StyleXStyles<{ '::before': { width: unknown } }>;

[
  styles.basic,
  styles.dynamicWithStringParam('100%'),
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  styles.empty,
  styles.multipleProperties,
  // @ts-expect-error - should disallow pseudo element
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStylesWithout<{ '::before': unknown }>;

[
  // @ts-expect-error - should disallow specified properties
  styles.basic,
  // @ts-expect-error - should disallow specified properties
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should disallow specified properties
  styles.dynamicWithNumericParam(100),
  // @ts-expect-error - should disallow specified properties
  styles.vars,
  // @ts-expect-error - should disallow specified properties
  styles.typedVars,
  styles.empty,
  // @ts-expect-error - should disallow specified properties
  styles.multipleProperties,
  styles.pseudoElement,
  // @ts-expect-error - should disallow specified properties
  styles.pseudoClass,
  // @ts-expect-error - should disallow specified properties
  styles.mediaQuery,
  // @ts-expect-error - should disallow specified properties
  styles.combinedConditions,
] satisfies stylex.StyleXStylesWithout<{ width: unknown }>;

[
  styles.basic,
  styles.dynamicWithStringParam('100%'),
  styles.dynamicWithNumericParam(100),
  styles.vars,
  styles.typedVars,
  styles.empty,
  // @ts-expect-error - should disallow specified properties
  styles.multipleProperties,
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StyleXStylesWithout<{ height: unknown }>;

[
  styles.basic,
  // @ts-expect-error - should disallow dynamic styles
  styles.dynamicWithStringParam('100%'),
  // @ts-expect-error - should disallow dynamic styles
  styles.dynamicWithNumericParam(100),
  // styles.empty - adding this breaks TypeScript,
  styles.vars,
  styles.typedVars,
  styles.multipleProperties,
  styles.pseudoElement,
  styles.pseudoClass,
  styles.mediaQuery,
  styles.combinedConditions,
] satisfies stylex.StaticStyles;
