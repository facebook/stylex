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

type Fraction = [number, '/', number];
type WordRule = 'color' | 'monochrome' | 'grid' | 'color-index';
type Length = TokenDimension[4];

type MediaRuleValue = Length | string | Fraction;

type MediaKeyword = {
  type: 'media-keyword',
  key: 'screen' | 'print' | 'all',
  not: boolean,
};
type MediaWordRule = { type: 'word-rule', keyValue: WordRule };
type MediaRulePair = {
  type: 'pair',
  key: string,
  value: MediaRuleValue,
};
type MediaNotRule = { type: 'not', rule: MediaRulePair | MediaWordRule };
type MediaAndRules = { type: 'and', rules: $ReadOnlyArray<MediaQueryRule> };
type MediaOrRules = { type: 'or', rules: $ReadOnlyArray<MediaQueryRule> };

type MediaQueryRule =
  | MediaKeyword
  | MediaWordRule
  | MediaRulePair
  | MediaNotRule
  | MediaAndRules
  | MediaOrRules;

const _mediaKeywordParser: TokenParser<'screen' | 'print' | 'all'> =
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue').where(
    (key) => key === 'screen' || key === 'print' || key === 'all',
    '=== "screen" | "print" | "all"',
  );

const mediaKeywordParser: TokenParser<MediaKeyword> = TokenParser.sequence(
  TokenParser.string('not').optional,
  _mediaKeywordParser,
).map(([not, keyword]) => ({
  type: 'media-keyword',
  key: keyword,
  not: not === 'not',
}));

const mediaWordRuleParser: TokenParser<MediaWordRule> =
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue')
    .surroundedBy(TokenParser.tokens.OpenParen, TokenParser.tokens.CloseParen)
    .where(
      (key) =>
        key === 'color' ||
        key === 'monochrome' ||
        key === 'grid' ||
        key === 'color-index',
      '=== "color" | "monochrome" | "grid" | "color-index"',
    )
    .map((key) => ({
      type: 'word-rule',
      keyValue: key,
    }));

const mediaRuleValueParser: TokenParser<MediaRuleValue> = TokenParser.oneOf(
  TokenParser.tokens.Dimension.map((token) => token[4]),
  TokenParser.tokens.Ident.map((token) => token[4].value),
  TokenParser.sequence(
    TokenParser.tokens.Number.map((token) => token[4].value),
    TokenParser.tokens.Delim.where(
      (token): implies token is TokenDelim => token[4].value === '/',
    ).map(() => '/'),
    TokenParser.tokens.Number.map((token) => token[4].value),
  ).separatedBy(TokenParser.tokens.Whitespace.optional),
);

const simplePairParser: TokenParser<MediaRulePair> = TokenParser.sequence(
  TokenParser.tokens.OpenParen,
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue'),
  TokenParser.tokens.Colon,
  mediaRuleValueParser,
  TokenParser.tokens.CloseParen,
)
  .separatedBy(TokenParser.tokens.Whitespace.optional)
  .map(([_openParen, key, _colon, value, _closeParen]) => ({
    type: 'pair',
    key,
    value,
  }));

const notParser: TokenParser<MediaNotRule> = TokenParser.sequence(
  TokenParser.tokens.OpenParen,
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue').where(
    (key) => key === 'not',
  ),
  TokenParser.tokens.Whitespace,
  TokenParser.oneOf(simplePairParser, mediaWordRuleParser),
  TokenParser.tokens.CloseParen,
).map(([_openParen, _not, _space, rule, _closeParen]) => ({
  type: 'not',
  rule,
}));

const mediaInequalityRuleParser: TokenParser<MediaRulePair> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<' || val === '>=' || val === '<=',
    ),
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen,
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, key, op, value, _closeParen]) => {
      const finalKey = op.startsWith('>') ? `min-${key}` : `max-${key}`;

      const finalValue =
        op === '>'
          ? { ...value, value: value.value + 0.01 }
          : op === '<'
            ? { ...value, value: value.value - 0.01 }
            : value;

      return {
        type: 'pair',
        key: finalKey,
        value: finalValue,
      };
    });

const doubleInequalityRuleParser: TokenParser<MediaAndRules> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<' || val === '>=' || val === '<=',
    ),
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<' || val === '>=' || val === '<=',
    ),
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen,
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, lower, op, key, op2, upper, _closeParen]) => {
      const lowerKey = op.startsWith('<') ? `min-${key}` : `max-${key}`;
      const upperKey = op2.startsWith('<') ? `max-${key}` : `min-${key}`;

      const lowerValue =
        op === '<'
          ? { ...lower, value: lower.value + 0.01 }
          : op === '>'
            ? { ...lower, value: lower.value - 0.01 }
            : lower;

      const upperValue =
        op2 === '<'
          ? { ...upper, value: upper.value - 0.01 }
          : op2 === '>'
            ? { ...upper, value: upper.value + 0.01 }
            : upper;

      const lowerPair = { type: 'pair', key: lowerKey, value: lowerValue };
      const upperPair = { type: 'pair', key: upperKey, value: upperValue };

      return {
        type: 'and',
        rules: [lowerPair, upperPair],
      };
    });

const mediaAndRulesParser: TokenParser<MediaAndRules | MediaQueryRule> =
  TokenParser.oneOrMore(
    TokenParser.oneOf(
      mediaKeywordParser,
      () =>
        mediaOrRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen,
        ),
      () =>
        mediaAndRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen,
        ),
      notParser,
      doubleInequalityRuleParser,
      mediaInequalityRuleParser,
      simplePairParser,
      mediaWordRuleParser,
    ),
  )
    .separatedBy(
      TokenParser.string('and').surroundedBy(TokenParser.tokens.Whitespace),
    )
    .map((rules) => (rules.length === 1 ? rules[0] : { type: 'and', rules }));

const mediaOrRulesParser: TokenParser<MediaOrRules | MediaQueryRule> =
  TokenParser.oneOrMore(
    TokenParser.oneOf(
      mediaKeywordParser,

      () =>
        mediaOrRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen,
        ),
      () =>
        mediaAndRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen,
        ),
      notParser,
      doubleInequalityRuleParser,
      mediaInequalityRuleParser,
      simplePairParser,
      mediaWordRuleParser,
    ),
  )
    .separatedBy(
      TokenParser.string('or').surroundedBy(TokenParser.tokens.Whitespace),
    )
    .map((rules) => (rules.length === 1 ? rules[0] : { type: 'or', rules }));

export class MediaQueryRecursive {
  queries: MediaQueryRule;
  constructor(queries: this['queries']) {
    this.queries = queries;
  }
  toString(): string {
    return `@media ${this.#toString(this.queries)}`;
  }
  #toString(queries: MediaQueryRule): string {
    switch (queries.type) {
      case 'media-keyword':
        return queries.not ? `not ${queries.key}` : queries.key;
      case 'word-rule':
        return `(${queries.keyValue})`;
      case 'pair': {
        const valueStr = Array.isArray(queries.value)
          ? `${queries.value[0]} / ${queries.value[2]}`
          : typeof queries.value === 'string'
            ? queries.value
            : `${queries.value.value}${queries.value.unit}`;

        return `(${queries.key}: ${valueStr})`;
      }
      case 'not':
        return `(not ${this.#toString(queries.rule)})`;
      case 'and':
        return queries.rules.map((rule) => this.#toString(rule)).join(' and ');
      case 'or':
        return queries.rules.map((rule) => this.#toString(rule)).join(' or ');
      default:
        return '';
    }
  }
  static get parser(): TokenParser<MediaQueryRecursive> {
    const leadingNotParser = TokenParser.sequence(
      TokenParser.tokens.AtKeyword.where(
        (token: TokenAtKeyword): implies token is TokenAtKeyword =>
          token[4].value === 'media',
      ),
      TokenParser.tokens.Ident.map(
        (token) => token[4].value,
        '.stringValue',
      ).where((key) => key === 'not'),
      TokenParser.oneOf(
        () =>
          mediaOrRulesParser.surroundedBy(
            TokenParser.tokens.OpenParen,
            TokenParser.tokens.CloseParen,
          ),
        () =>
          mediaAndRulesParser.surroundedBy(
            TokenParser.tokens.OpenParen,
            TokenParser.tokens.CloseParen,
          ),
        notParser,
        mediaInequalityRuleParser,
        simplePairParser,
        mediaWordRuleParser,
      ),
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_at, _not, queries]) => new MediaQueryRecursive(queries));

    const recursiveParser = TokenParser.sequence(
      TokenParser.tokens.AtKeyword.where(
        (token: TokenAtKeyword): implies token is TokenAtKeyword =>
          token[4].value === 'media',
      ),
      TokenParser.oneOf(mediaAndRulesParser, mediaOrRulesParser),
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_at, queries]) => new MediaQueryRecursive(queries));

    return recursiveParser.or(leadingNotParser);
  }
}

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
  sep: string;
  value: TokenDimension[4] | string | [number, '/', number];
  constructor(key: this['key'], sep: this['sep'], value: this['value']) {
    this.key = key;
    this.sep = sep;
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

      TokenParser.oneOf<string>(
        TokenParser.tokens.Colon.map(() => ':'),
        TokenParser.sequence(
          TokenParser.tokens.Delim.where(
            (token): implies token is TokenDelim =>
              token[4].value === '>' || token[4].value === '<',
          ).map((token) => token[4].value),
          TokenParser.tokens.Delim.where(
            (token): implies token is TokenDelim => token[4].value === '=',
          ).optional.map((token) => token?.[4].value ?? ''),
        ).map(([op, value]) => `${op}${value}`),
      ),

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
        ([_openParen, key, sep, value, _closeParen]) =>
          new MediaQuerySinglePair(key, sep, value),
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
