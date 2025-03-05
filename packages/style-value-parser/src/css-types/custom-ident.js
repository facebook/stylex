/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export class CustomIdentifier {
  +value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
  static get parse(): Parser<CustomIdentifier> {
    const escape: Parser<string> = Parser.oneOf(
      Parser.string('\\\\'), // Backslash
      Parser.string('\\"'), // Double quote
      Parser.string("\\'"), // Single quote
      Parser.string('\\.'), // dot
      Parser.string('\\#'), // hash
      Parser.string('\\:'), // colon
      Parser.string('\\;'), // semi-colon
      Parser.string('\\ '), // space
      Parser.string('\\+'), // plus
      // Unicode character. Backslash followed by 1-6 hex digits
      Parser.sequence(
        Parser.string('\\'),
        Parser.regex(/[\da-fA-F]{1,6} /),
      ).map((arr) => arr.join('')),
    );

    const nameStart: Parser<string> = Parser.oneOf(
      Parser.letter,
      Parser.string('_'),
      Parser.sequence(Parser.string('-'), Parser.letter).map((arr) =>
        arr.join(''),
      ),
      escape,
    );
    const restOfTheName: Parser<string> = Parser.oneOf(
      nameStart,
      Parser.digit,
      Parser.string('-'),
      escape,
    );
    return Parser.sequence(
      nameStart,
      Parser.zeroOrMore(restOfTheName).map((arr) => arr.join('')),
    ).map(([start, rest]) => new CustomIdentifier(start + rest));
  }
}
