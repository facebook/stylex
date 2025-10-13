/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as stylex from '@stylexjs/stylex';

const basicVars = stylex.defineVars({
  foo: 'red',
  bar: 'blue',
});

basicVars satisfies stylex.VarGroup<{ foo: unknown; bar: unknown }>;
basicVars satisfies stylex.VarGroup<{
  foo: unknown;
  bar: unknown;
  baz?: unknown;
}>;

// @ts-expect-error - should disallow different var type
basicVars satisfies stylex.VarGroup<{ foo: number; bar: unknown }>;

// @ts-expect-error - should disallow missing vars
basicVars satisfies stylex.VarGroup<{
  foo: unknown;
  bar: unknown;
  baz: unknown;
}>;

const basicConsts = stylex.defineConsts({
  foo: 'red',
  bar: 'blue',
});

basicConsts satisfies Readonly<{ foo: unknown; bar: unknown }>;
basicConsts satisfies Readonly<{
  foo: unknown;
  bar: unknown;
  baz?: unknown;
}>;

// @ts-expect-error - should disallow different var type
basicConsts satisfies stylex.VarGroup<{ foo: number; bar: unknown }>;

// @ts-expect-error - should disallow missing vars
basicConsts satisfies stylex.VarGroup<{
  foo: unknown;
  bar: unknown;
  baz: unknown;
}>;

const exactVars = stylex.defineVars({
  foo: 'red',
  bar: 'blue',
} as const);

exactVars satisfies stylex.VarGroup<{ foo: 'red'; bar: 'blue' }>;

const narrowedVars: stylex.VarGroup<{
  foo: 'red' | 'blue';
  bar: 'red' | 'blue';
}> = stylex.defineVars({
  foo: 'red',
  bar: 'blue',
});

narrowedVars satisfies stylex.VarGroup<{ foo: unknown; bar: unknown }>;

// @ts-expect-error - should disallow missing var
const narrowedVarsWithMissingVar: stylex.VarGroup<{
  foo: 'red' | 'blue';
  bar: 'red' | 'blue';
}> = stylex.defineVars({
  foo: 'red',
});

// @ts-expect-error - should disallow invalid values
const narrowedVarsWithInvalidValue: stylex.VarGroup<{
  foo: 'red' | 'blue';
  bar: 'red' | 'blue';
}> = stylex.defineVars({
  foo: 'red',
  bar: 'green',
});

declare const ExampleColors: unique symbol;
declare const OtherColors: unique symbol;

const uniqueIdentityVars: stylex.VarGroup<
  {
    foo: 'red' | 'blue';
    bar: 'red' | 'blue';
  },
  typeof ExampleColors
> = stylex.defineVars({
  foo: 'red',
  bar: 'blue',
});

// @ts-expect-error - should disallow non-matching unique type identity
narrowedVars satisfies stylex.VarGroup<
  { foo: unknown; bar: unknown },
  typeof OtherColors
>;

const basicTheme = stylex.createTheme(basicVars, {
  foo: 'red',
  bar: 'blue',
});

basicTheme satisfies stylex.Theme<
  stylex.VarGroup<{
    foo: string;
    bar: string;
  }>
>;

stylex.createTheme(basicVars, {});
stylex.createTheme(basicVars, { foo: 'red' });
stylex.createTheme(basicVars, { bar: 'blue' });
// @ts-expect-error - should disallow extra properties in overrides
stylex.createTheme(basicVars, { baz: 'green' });

const exactTheme = stylex.createTheme(exactVars, {
  foo: 'red',
  bar: 'blue',
});

exactTheme satisfies stylex.Theme<
  stylex.VarGroup<{
    foo: 'red';
    bar: 'blue';
  }>
>;

stylex.createTheme(exactVars, {});
stylex.createTheme(exactVars, { foo: 'red' });
stylex.createTheme(exactVars, { bar: 'blue' });
// @ts-expect-error - should disallow invalid values in overrides
stylex.createTheme(exactVars, { foo: 'blue' });
// @ts-expect-error - should disallow invalid values in overrides
stylex.createTheme(exactVars, { bar: 'red' });
// @ts-expect-error - should disallow extra properties in overrides
stylex.createTheme(exactVars, { baz: 'green' });

declare const ExampleTheme: unique symbol;
declare const OtherTheme: unique symbol;

const uniqueIdentityTheme: stylex.Theme<typeof basicVars, typeof ExampleTheme> =
  stylex.createTheme(basicVars, {});

// @ts-expect-error - should disallow non-matching unique type identity
uniqueIdentityTheme satisfies stylex.Theme<typeof basicVars, typeof OtherTheme>;
