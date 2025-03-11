/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import {
  LengthBasedOnAbsoluteUnits,
  LengthBasedOnViewport,
  Rem,
  Rlh,
  Length,
} from '../css-types/length';

import { Parser } from '../core';

interface StringRepresentable {
  toString(): string;
}

const mediaQueryLengthParser = Parser.oneOf<Length>(
  LengthBasedOnAbsoluteUnits.parse,
  LengthBasedOnViewport.parse,
  Rem.parse,
  Rlh.parse,
);

function mediaRuleKeyValueParser<T: StringRepresentable>(
  key: string,
  valueParser: Parser<T>,
): Parser<T> {
  return Parser.sequence(
    Parser.string('('),
    Parser.string(key).surroundedBy(Parser.whitespace.optional),
    Parser.string(':').surroundedBy(Parser.whitespace.optional),
    valueParser,
    Parser.whitespace.optional,
    Parser.string(')'),
  ).map(([_a, _b, _c, unit, _d, _e]) => unit);
}

export class MediaRule<T: StringRepresentable> {
  +key: string;
  +value: T;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
  }
  toString(): string {
    return `(${this.key}: ${this.value.toString()})`;
  }
}

export class MinWidthMediaRule extends MediaRule<Length> {
  +key: 'min-width';

  constructor(minWidth: Length) {
    super('min-width', minWidth);
  }

  static get parse(): Parser<MinWidthMediaRule> {
    return mediaRuleKeyValueParser('min-width', mediaQueryLengthParser).map(
      (length) => new MinWidthMediaRule(length),
    );
  }
}

export class MaxWidthMediaRule extends MediaRule<Length> {
  +key: 'max-width';

  constructor(maxWidth: Length) {
    super('max-width', maxWidth);
  }

  static get parse(): Parser<MaxWidthMediaRule> {
    return mediaRuleKeyValueParser('max-width', mediaQueryLengthParser).map(
      (length) => new MaxWidthMediaRule(length),
    );
  }
}

export class MinHeightMediaRule extends MediaRule<Length> {
  +key: 'min-height';

  constructor(minHeight: Length) {
    super('min-height', minHeight);
  }

  static get parse(): Parser<MinHeightMediaRule> {
    return mediaRuleKeyValueParser('min-height', mediaQueryLengthParser).map(
      (length) => new MinHeightMediaRule(length),
    );
  }
}

export class MaxHeightMediaRule extends MediaRule<Length> {
  +key: 'max-height';

  constructor(maxHeight: Length) {
    super('max-height', maxHeight);
  }

  static get parse(): Parser<MaxHeightMediaRule> {
    return mediaRuleKeyValueParser('max-height', mediaQueryLengthParser).map(
      (length) => new MaxHeightMediaRule(length),
    );
  }
}
