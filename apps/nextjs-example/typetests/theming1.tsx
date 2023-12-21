/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/* eslint-disable no-unused-vars */

import stylex from '@stylexjs/stylex';
import type {
  TokensFromVarGroup,
  StyleXVar,
  VarGroup,
  Theme,
  CompiledStyles,
} from '@stylexjs/stylex/lib/StyleXTypes';

const DARK = '@media (prefers-color-scheme: dark)';

const buttonTokens = stylex.defineVars({
  bgColor: 'cyan',
  textColor: {
    default: 'black',
    [DARK]: 'white',
  },
  cornerRadius: '4px',
  paddingBlock: '4px',
  paddingInline: '8px',
});

// DefineVars creates the right type.
buttonTokens satisfies VarGroup<
  Readonly<{
    bgColor: string;
    textColor: string;
    cornerRadius: string;
    paddingBlock: string;
    paddingInline: string;
  }>,
  symbol
>;
buttonTokens.bgColor satisfies StyleXVar<string>;

type TokensType = TokensFromVarGroup<typeof buttonTokens>;
({
  bgColor: 'red',
  textColor: 'white',
  cornerRadius: '4px',
  paddingBlock: '4px',
  paddingInline: '8px',
}) satisfies TokensType;

({
  bgColor: 'red',
  textColor: 'white',
  // @ts-expect-error - cornerRadius is a string.
  cornerRadius: 4,
  paddingBlock: '4px',
  paddingInline: '8px',
}) satisfies TokensType;

({
  bgColor: 'red',
  textColor: 'white',
  paddingBlock: '4px',
  paddingInline: '8px',
  // @ts-expect-error - cornerRadius is missing.
}) satisfies TokensType;

const correctTheme = stylex.createTheme(buttonTokens, {
  bgColor: {
    default: 'pink',
    [DARK]: 'navy',
    '@media (max-width: 700px)': 'red',
  },
  textColor: 'white',
  cornerRadius: '4px',
  paddingBlock: '4px',
  paddingInline: '8px',
});

correctTheme satisfies Theme<typeof buttonTokens, symbol>;

correctTheme satisfies CompiledStyles;

const result: string = stylex(correctTheme);
const result2: Readonly<{
  className?: string;
  style?: Readonly<{ [key: string]: string | number }>;
}> = stylex.props(correctTheme);

const wrongTheme1 = stylex.createTheme(buttonTokens, {
  bgColor: 'red',
  textColor: 'white',
  // @ts-expect-error - cornerRadius is a string.
  cornerRadius: 1,
  paddingBlock: '4px',
  paddingInline: '8px',
});

const varsA = stylex.defineVars({
  varA1: 'red',
});

const themeA = stylex.createTheme(varsA, {
  varA1: 'green',
});

// Define a themeB

const varsB = stylex.defineVars({
  varB1: 'red',
  varB2: 'blue',
});

const themeB = stylex.createTheme(varsB, {
  varB1: 'green',
});

// Create a themeable component, allowing only themeA type

const MyComponent: React.FC<{ theme: Theme<typeof varsA> }> = ({ theme }) => (
  <div {...stylex.props(theme)} />
);

const a1: Theme<typeof varsA> = themeA;
const b1: Theme<typeof varsB> = themeB;

// @ts-expect-error - themeB is not compatible with themeA
const bIsNotA: Theme<typeof varsA> = themeB;

// @ts-expect-error - themeA is not compatible with themeB
const aIsNotB: Theme<typeof varsB> = themeA;

// Instantiate component with themeA
const Correct: React.FC = () => <MyComponent theme={themeA} />;

// @ts-expect-error - themeB is not compatible with themeA
const Incorrect: React.FC = () => <MyComponent theme={themeB} />;

// Usage of themes with stylex.props
const p1 = stylex.props(themeA);
const p2 = stylex.props(themeB);

// @ts-expect-error - You can apply themes, not varGroups
const v1 = stylex.props(varsA);
// @ts-expect-error - You can apply themes, not varGroups
const v2 = stylex.props(varsB);

// It should be possible to define vars based on other vars
const varsC = stylex.defineVars({
  varC1: varsA.varA1,
});

// But the override should still be a string.
const themeC = stylex.createTheme(varsC, {
  varC1: 'green',
});
