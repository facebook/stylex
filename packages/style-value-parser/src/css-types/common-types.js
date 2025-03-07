/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export const inherit: Parser<'inherit'> = Parser.string('inherit');
export const initial: Parser<'initial'> = Parser.string('initial');
export const unset: Parser<'unset'> = Parser.string('unset');
export const revert: Parser<'revert'> = Parser.string('revert');
// Purposely not exported
// StyleX will not support this value
// export const revertLayer: Parser<string> = Parser.string("revert-layer");

export const cssWideKeywords: Parser<
  'inherit' | 'initial' | 'unset' | 'revert',
> = Parser.oneOf(
  inherit,
  initial,
  unset,
  revert,
  // revertLayer
);

export const auto: Parser<string> = Parser.string('auto');

export class CssVariable {
  +name: string;
  constructor(name: string) {
    this.name = name;
  }
  toString(): string {
    return `var(--${this.name})`;
  }
  static parse: Parser<CssVariable> = Parser.sequence(
    Parser.string('var(--'),
    Parser.regex(/[a-zA-Z0-9_-]+/),
    Parser.string(')'),
  ).map(([_, name, __]: [string, string, string]) => new CssVariable(name));
}

export class Percentage {
  +value: number;
  constructor(value: number) {
    this.value = value;
  }
  toString(): string {
    return `${this.value}%`;
  }
  static parse: Parser<Percentage> = Parser.float
    .skip(Parser.string('%'))
    .map((v) => new Percentage(v));
}

export const numberOrPercentage: Parser<number | Percentage> = Parser.oneOf(
  Percentage.parse,
  Parser.float,
);
