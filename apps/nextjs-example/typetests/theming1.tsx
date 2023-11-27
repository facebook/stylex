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

const wrongTheme2 = stylex.createTheme(
  buttonTokens,
  // @ts-expect-error - cornerRadius is missing.
  {
    bgColor: 'red',
    textColor: 'white',
    paddingBlock: '4px',
    paddingInline: '8px',
  },
);
