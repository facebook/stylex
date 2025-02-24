/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// import {
//   UNITS_BASED_ON_FONT,
//   UNITS_BASED_ON_ABSOLUTE_UNITS,
//   Length,
// } from '../css-types-from-tokens/length';

import { TokenParser } from '../core2';
import type {
  TokenAtKeyword,
  TokenDelim,
  TokenDimension,
} from '@csstools/css-tokenizer';

// const mediaQueryLengthParser = Length.parser.where(
//   (length): implies length is Length =>
//     UNITS_BASED_ON_ABSOLUTE_UNITS.includes(length.unit) ||
//     UNITS_BASED_ON_FONT.includes(length.unit),
// );

export class MediaQuery {
  queries: OrSeparatedMediaRules;
  constructor(queries: this['queries']) {
    this.queries = queries;
  }
  toString(): string {
    return `@media ${this.queries.toString()}`;
  }
  static get parser(): TokenParser<MediaQuery> {
    return TokenParser.sequence(
      TokenParser.tokens.AtKeyword.where(
        (token: TokenAtKeyword): implies token is TokenAtKeyword =>
          token[4].value === 'media',
      ),
      OrSeparatedMediaRules.parser,
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_at, queries]) => new MediaQuery(queries));
  }
}

export class MediaRule {
  rules: NotMediaRule | MediaQuerySinglePair | MediaQuerySingleWordCondition;
  constructor(rules: this['rules']) {
    this.rules = rules;
  }
  toString(): string {
    return this.rules.toString();
  }
  static get parser(): TokenParser<MediaRule> {
    return TokenParser.oneOf(
      NotMediaRule.parser.map((notRule) => new MediaRule(notRule)),
      MediaQuerySinglePair.parser.map(
        (singleRule) => new MediaRule(singleRule),
      ),
      MediaQuerySingleWordCondition.parser.map(
        (singleRule) => new MediaRule(singleRule),
      ),
    );
  }
}

export class MediaQueryKeywords {
  key: 'screen' | 'print';
  constructor(key: this['key']) {
    this.key = key;
  }
  toString(): string {
    return `@${this.key}`;
  }
  static get parser(): TokenParser<MediaQueryKeywords> {
    return TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    )
      .where(
        (key) => key === 'screen' || key === 'print',
        '=== "screen" | "print"',
      )
      .map((key) => new MediaQueryKeywords(key));
  }
}

export class MediaQuerySingleWordCondition {
  keyValue: 'color' | 'monochrome' | 'grid' | 'color-index';
  constructor(keyValue: this['keyValue']) {
    this.keyValue = keyValue;
  }
  toString(): string {
    return `(${this.keyValue})`;
  }
  static get parser(): TokenParser<MediaQuerySingleWordCondition> {
    return TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    )
      .surroundedBy(TokenParser.tokens.OpenParen, TokenParser.tokens.CloseParen)
      .where(
        (key) =>
          key === 'color' ||
          key === 'monochrome' ||
          key === 'grid' ||
          key === 'color-index',
        '=== "color" | "monochrome" | "grid" | "color-index"',
      )
      .map((key) => new MediaQuerySingleWordCondition(key));
  }
}

export class MediaQuerySinglePair {
  key: string;
  value: TokenDimension[4] | string | [number, '/', number];
  constructor(key: this['key'], value: this['value']) {
    this.key = key;
    this.value = value;
  }
  toString(): string {
    const value = Array.isArray(this.value)
      ? this.value.join(' ')
      : this.value.toString();
    return `(${this.key}: ${value})`;
  }
  static get parser(): TokenParser<MediaQuerySinglePair> {
    return TokenParser.sequence(
      TokenParser.tokens.OpenParen,
      TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue'),
      TokenParser.tokens.Colon,
      TokenParser.oneOf(
        TokenParser.tokens.Dimension.map(
          (token) => `${token[4].value}${token[4].unit}`,
        ),
        TokenParser.tokens.Ident.map((token) => token[4].value),
        TokenParser.sequence(
          TokenParser.tokens.Number.map((token) => token[4].value),
          TokenParser.tokens.Delim.where(
            (token): implies token is TokenDelim => token[4].value === '/',
          ).map(() => '/'),
          TokenParser.tokens.Number.map((token) => token[4].value),
        ).separatedBy(TokenParser.tokens.Whitespace.optional),
      ),
      TokenParser.tokens.CloseParen,
    )
      .separatedBy(TokenParser.tokens.Whitespace.optional)
      .map(
        ([_a, key, _c, value, _d, _e]) => new MediaQuerySinglePair(key, value),
      );
  }
}

export class NotMediaRule {
  rule: MediaQuerySinglePair | MediaQuerySingleWordCondition;
  constructor(rule: this['rule']) {
    this.rule = rule;
  }
  toString(): string {
    return `(not ${this.rule.toString()})`;
  }
  static get parser(): TokenParser<NotMediaRule> {
    return TokenParser.sequence(
      TokenParser.tokens.OpenParen,
      TokenParser.tokens.Ident.map(
        (token) => token[4].value,
        '.stringValue',
      ).where((key) => key === 'not'),
      TokenParser.tokens.Whitespace,
      TokenParser.oneOf(
        MediaQuerySinglePair.parser,
        MediaQuerySingleWordCondition.parser,
      ),
      TokenParser.tokens.CloseParen,
    ).map(([_open, _not, _space, rule, _close]) => new NotMediaRule(rule));
  }
}

export class AndSeparatedMediaRules {
  queries: $ReadOnlyArray<MediaQueryKeywords | MediaRule | NotMediaRule>;
  constructor(queries: this['queries']) {
    this.queries = queries;
  }
  toString(): string {
    return this.queries.map((query) => query.toString()).join(' and ');
  }
  static get parser(): TokenParser<AndSeparatedMediaRules> {
    return TokenParser.oneOrMore(
      TokenParser.oneOf(
        MediaQueryKeywords.parser,
        // () => OrSeparatedMediaRules.parser,
        NotMediaRule.parser,
        MediaRule.parser,
      ),
    )
      .separatedBy(
        TokenParser.string('and').surroundedBy(TokenParser.tokens.Whitespace),
      )
      .map((rules) => new AndSeparatedMediaRules(rules));
  }
}

export class OrSeparatedMediaRules {
  queries: $ReadOnlyArray<
    MediaQueryKeywords | MediaRule | NotMediaRule | AndSeparatedMediaRules,
  >;
  constructor(queries: this['queries']) {
    this.queries = queries;
  }
  toString(): string {
    return this.queries.map((query) => query.toString()).join(' or ');
  }
  static get parser(): TokenParser<OrSeparatedMediaRules> {
    return TokenParser.oneOrMore(
      TokenParser.oneOf(
        () => AndSeparatedMediaRules.parser,
        MediaQueryKeywords.parser,
        NotMediaRule.parser,
        MediaRule.parser,
      ),
    )
      .separatedBy(
        TokenParser.oneOf(
          TokenParser.string('or').surroundedBy(TokenParser.tokens.Whitespace),
          TokenParser.tokens.Comma.surroundedBy(
            TokenParser.tokens.Whitespace.optional,
          ),
        ),
      )
      .map((rules) => new OrSeparatedMediaRules(rules));
  }
}

// Range syntax parsers

// export class CommaSeparatedMediaQuery {
//   queries: $ReadOnlyArray<MediaRule>;
