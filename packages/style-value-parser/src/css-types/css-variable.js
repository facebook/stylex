/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';
import { DashedIdentifier } from './dashed-ident';

interface Stringable {
  toString(): string;
}

export class CSSVariable<+Fallback: Stringable> {
  +varName: DashedIdentifier;
  +fallback: ?Fallback;
  +fallbackParser: Parser<Fallback>;

  constructor(varName: this['varName'], fallback: this['fallback']) {
    this.varName = varName;
    this.fallback = fallback;
  }

  toString(): string {
    if (this.fallback == null) {
      return `var(${this.varName.toString()})`;
    }

    const fallback = this.fallback;
    return `var(${this.varName.toString()},${fallback.toString()})`;
  }

  static parse<Fallback: Stringable>(
    fallbackParser: Parser<Fallback>,
  ): Parser<CSSVariable<Fallback>> {
    const varOnly = Parser.sequence(
      Parser.string('var('),
      DashedIdentifier.parse,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(([_, ident]) => new CSSVariable<Fallback>(ident));

    const varWithFallback = Parser.sequence(
      Parser.string('var('),
      DashedIdentifier.parse,
      Parser.string(','),
      fallbackParser,
      Parser.string(')'),
    )
      .separatedBy(Parser.whitespace.optional)
      .map(
        ([_, ident, _comma, fallback]) =>
          new CSSVariable<Fallback>(ident, fallback),
      );

    return Parser.oneOf(varWithFallback, varOnly).surroundedBy(
      Parser.whitespace.optional,
    );
  }
}
