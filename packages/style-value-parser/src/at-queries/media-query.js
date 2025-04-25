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
// } from '../css-types/length';

import { TokenParser } from '../token-parser';
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
type MediaNotRule = { type: 'not', rule: MediaQueryRule };
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

function _isAndOrRule(
  rule: MediaQueryRule,
): rule is MediaAndRules | MediaOrRules {
  return rule.type === 'and' || rule.type === 'or';
}

const mediaKeywordParser: TokenParser<MediaKeyword> = TokenParser.sequence(
  TokenParser.string('not').optional,
  _mediaKeywordParser,
)
  .separatedBy(TokenParser.tokens.Whitespace)
  .map(([not, keyword]) => ({
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

export const mediaInequalityRuleParser: TokenParser<MediaRulePair> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<',
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '=',
    ).optional,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen,
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, key, op, eq, value, _closeParen]) => {
      const finalKey = op === '>' ? `min-${key}` : `max-${key}`;

      const finalValue =
        op === '>' && eq !== '='
          ? { ...value, value: value.value + 0.01 }
          : op === '<' && eq !== '='
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
      (val) => val === '>' || val === '<',
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '=',
    ).optional,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue',
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<',
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '=',
    ).optional,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen,
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, lower, op, eq, key, op2, eq2, upper, _closeParen]) => {
      const lowerKey = op === '<' ? `min-${key}` : `max-${key}`;
      const upperKey = op2 === '<' ? `max-${key}` : `min-${key}`;

      const lowerValue =
        op === '<' && eq !== '='
          ? { ...lower, value: lower.value + 0.01 }
          : op === '>' && eq !== '='
            ? { ...lower, value: lower.value - 0.01 }
            : lower;

      const upperValue =
        op2 === '<' && eq2 !== '='
          ? { ...upper, value: upper.value - 0.01 }
          : op2 === '>' && eq2 !== '='
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
    .where(
      <T>(rules: $ReadOnlyArray<T>): implies rules is $ReadOnlyArray<T> =>
        rules.length > 1,
      'rules.length > 1',
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
    .where(
      <T>(rules: $ReadOnlyArray<T>): implies rules is $ReadOnlyArray<T> =>
        rules.length > 1,
      'rules.length > 1',
    )
    .map((rules) => (rules.length === 1 ? rules[0] : { type: 'or', rules }));

export class MediaQuery {
  queries: MediaQueryRule;
  constructor(queries: this['queries']) {
    this.queries = MediaQuery.normalize(queries);
  }
  toString(): string {
    return `@media ${this.#toString(this.queries, true)}`;
  }
  #toString(queries: MediaQueryRule, isTopLevel: boolean = false): string {
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
        return queries.rule && _isAndOrRule(queries.rule)
          ? `(not (${this.#toString(queries.rule)}))`
          : `(not ${this.#toString(queries.rule)})`;
      case 'and':
        return queries.rules.map((rule) => this.#toString(rule)).join(' and ');
      case 'or':
        return isTopLevel
          ? queries.rules.map((rule) => this.#toString(rule)).join(', ')
          : queries.rules.map((rule) => this.#toString(rule)).join(' or ');
      default:
        return '';
    }
  }
  static normalize(rule: MediaQueryRule): MediaQueryRule {
    switch (rule.type) {
      case 'and': {
        const flattened: MediaQueryRule[] = [];
        for (const r of rule.rules) {
          const norm = MediaQuery.normalize(r);
          if (norm.type === 'and') {
            flattened.push(...norm.rules);
          } else {
            flattened.push(norm);
          }
        }
        return { type: 'and', rules: flattened };
      }
      case 'or':
        return {
          type: 'or',
          rules: rule.rules.map((r) => MediaQuery.normalize(r)),
        };
      case 'not': {
        let count = 1;
        let inner = MediaQuery.normalize(rule.rule);
        while (inner.type === 'not') {
          count++;
          inner = MediaQuery.normalize(inner.rule);
        }
        if (inner.type === 'pair' || inner.type === 'word-rule') {
          return count % 2 === 0 ? inner : { type: 'not', rule: inner };
        }
        return inner;
      }
      default:
        return rule;
    }
  }

  static get parser(): TokenParser<MediaQuery> {
    const leadingNotParser = TokenParser.sequence(
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
      .map(([_not, queries]) => queries);

    const normalRuleParser = TokenParser.oneOf(
      mediaAndRulesParser,
      mediaOrRulesParser,
      mediaKeywordParser,
      notParser,
      doubleInequalityRuleParser,
      mediaInequalityRuleParser,
      simplePairParser,
      mediaWordRuleParser,
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
    );

    return TokenParser.sequence(
      TokenParser.tokens.AtKeyword.where(
        (token: TokenAtKeyword): implies token is TokenAtKeyword =>
          token[4].value === 'media',
      ),
      TokenParser.oneOrMore(
        TokenParser.oneOf(leadingNotParser, normalRuleParser),
      ).separatedBy(
        TokenParser.tokens.Comma.surroundedBy(
          TokenParser.tokens.Whitespace.optional,
        ),
      ),
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_at, querySets]) => {
        const rule =
          querySets.length > 1
            ? { type: 'or', rules: querySets }
            : querySets[0];
        return new MediaQuery(rule);
      });
  }
}
