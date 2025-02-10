/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../core2';
import type {
  TokenCloseParen,
  TokenFunction,
  TokenIdent,
  TokenNumber,
  TokenPercentage,
} from '@csstools/css-tokenizer';

import { TokenType } from '@csstools/css-tokenizer';

export const inherit: TokenParser<'inherit'> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<'inherit'>((v): v is 'inherit' => v === 'inherit');
export const initial: TokenParser<'initial'> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<'initial'>((v): v is 'initial' => v === 'initial');
export const unset: TokenParser<'unset'> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<'unset'>((v): v is 'unset' => v === 'unset');
export const revert: TokenParser<'revert'> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<'revert'>((v): v is 'revert' => v === 'revert');
// Purposely not exported
// StyleX will not support this value
// export const revertLayer: TokenParser<string> = TokenParser.token<TokenIdent>(
//   TokenType.Ident,
// )
//   .where((v) => v[4].value === 'revert-layer')
//   .map(() => 'revert-layer');

export const cssWideKeywords: TokenParser<
  'inherit' | 'initial' | 'unset' | 'revert',
> = TokenParser.oneOf(
  inherit,
  initial,
  unset,
  revert,
  // revertLayer
);

export const auto: TokenParser<string> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<string>((v): v is 'auto' => v === 'auto');

export class CssVariable {
  +name: string;
  constructor(name: string) {
    this.name = name;
  }
  toString(): string {
    return `var(--${this.name})`;
  }
  static parse: TokenParser<CssVariable> = TokenParser.sequence(
    TokenParser.token<TokenFunction>(TokenType.Function)
      .map((v): string => v[4].value)
      .where<string>((v): v is 'var' => v === 'var'),
    TokenParser.token<TokenIdent>(TokenType.Ident)
      .map((v): string => v[4].value)
      .where<string>((v): implies v is string => v.startsWith('--')),
    TokenParser.token<TokenCloseParen>(TokenType.CloseParen),
  ).map(
    ([_, name, __]: $ReadOnly<[mixed, string, mixed]>) => new CssVariable(name),
  );
}

export class Percentage {
  +value: number;
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return `${this.value}%`;
  }
  static parse: TokenParser<Percentage> = TokenParser.token<TokenPercentage>(
    TokenType.Percentage,
  ).map(
    (v) =>
      new Percentage(v[4].signCharacter === '-' ? -v[4].value : v[4].value),
  );
}

export const numberOrPercentage: TokenParser<number | Percentage> =
  TokenParser.oneOf(
    Percentage.parse,
    TokenParser.token<TokenNumber>(TokenType.Number).map((v) =>
      v[4].signCharacter === '-' ? -v[4].value : v[4].value,
    ),
  );
