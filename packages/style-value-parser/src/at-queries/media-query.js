/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { TokenParser } from '../token-parser';
import type {
  TokenAtKeyword,
  TokenDelim,
  TokenDimension,
} from '@csstools/css-tokenizer';

import {
  Calc,
} from '../css-types/calc';

type Fraction = [number, '/', number];
type WordRule = 'color' | 'monochrome' | 'grid' | 'color-index';
type Length = TokenDimension[4];

type MediaRuleValue = Length | string | Fraction;

type MediaKeyword = {
  type: 'media-keyword',
  key: 'screen' | 'print' | 'all',
  not: boolean,
  only?: boolean,
};
type MediaWordRule = { type: 'word-rule', keyValue: WordRule };
type MediaRulePair = {
  type: 'pair',
  key: string,
  value: MediaRuleValue,
};
type MediaNotRule = { type: 'not', rule: MediaRulePair | MediaWordRule };
type MediaAndRules = { type: 'and', rules: ReadonlyArray<MediaQueryRule> };
type MediaOrRules = { type: 'or', rules: ReadonlyArray<MediaQueryRule> };

type MediaQueryRule =
  | MediaKeyword
  | MediaWordRule
  | MediaRulePair
  | MediaNotRule
  | MediaAndRules
  | MediaOrRules;

// helper to adjust the numeric value when no equality sign is present.
// note: this uses a fixed epsilon of 0.01; adjust as needed per unit.
function adjustDimension(
  dimension: Length,
  op: string,
  eq: string | undefined,
  reversed = false
): Length {
  let adjustedValue = dimension.value;
  const epsilon = 0.01;
  if (eq !== '=') {
    if (!reversed) {
      if (op === '>') {
        adjustedValue += epsilon;
      } else if (op === '<') {
        adjustedValue -= epsilon;
      }
    } else {
      // reversed inequality has the opposite adjustment
      if (op === '>') {
        adjustedValue -= epsilon;
      } else if (op === '<') {
        adjustedValue += epsilon;
      }
    }
  }
  return { ...dimension, value: adjustedValue };
}

const basicMediaTypeParser: TokenParser<'screen' | 'print' | 'all'> =
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue').where(
    (key) => key === 'screen' || key === 'print' || key === 'all'
  );

// updated to support optional "not" and "only"
const mediaKeywordParser: TokenParser<MediaKeyword> = TokenParser.sequence(
  TokenParser.string('not').optional,
  TokenParser.string('only').optional,
  basicMediaTypeParser
)
  .separatedBy(TokenParser.tokens.Whitespace)
  .map(([not, only, keyword]) => ({
    type: 'media-keyword',
    key: keyword,
    not: not === 'not',
    only: only === 'only',
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

// modified mediaRuleValueParser to include calc support; this branch uses Calc.parser
// and maps the output to its toString() representation.
const mediaRuleValueParser: TokenParser<MediaRuleValue> = TokenParser.oneOf(
  Calc.parser.map((calc) => calc.toString()),
  TokenParser.tokens.Dimension.map((token) => token[4]),
  TokenParser.tokens.Ident.map((token) => token[4].value),
  TokenParser.sequence(
    TokenParser.tokens.Number.map((token) => token[4].value),
    TokenParser.tokens.Delim.where(
      (token): token is any => token[4].value === '/'
    ).map(() => '/'),
    TokenParser.tokens.Number.map((token) => token[4].value)
  ).separatedBy(TokenParser.tokens.Whitespace.optional)
);

const simplePairParser: TokenParser<MediaRulePair> = TokenParser.sequence(
  TokenParser.tokens.OpenParen,
  TokenParser.tokens.Ident.map((token) => token[4].value, '.stringValue'),
  TokenParser.tokens.Colon,
  mediaRuleValueParser,
  TokenParser.tokens.CloseParen
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
    (key) => key === 'not'
  ),
  TokenParser.tokens.Whitespace,
  TokenParser.oneOf(simplePairParser, mediaWordRuleParser),
  TokenParser.tokens.CloseParen
).map(([_openParen, _not, _space, rule, _closeParen]) => ({
  type: 'not',
  rule,
}));

// forward inequality: (width <= 1250px) or (width < 1250px)
export const mediaInequalityRuleParser: TokenParser<MediaRulePair> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue'
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<'
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '='
    ).optional,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, key, op, eq, dimension, _closeParen]) => {
      // for forward inequality, e.g. (width < 1250px) becomes max-width
      const finalKey = op === '>' ? `min-${key}` : `max-${key}`;
      const adjustedDimension = adjustDimension(dimension, op, eq);
      return {
        type: 'pair',
        key: finalKey,
        value: adjustedDimension,
      };
    });

// reversed inequality: (1250px >= width) or (1250px > width)
const mediaInequalityRuleParserReversed: TokenParser<MediaRulePair> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<'
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '='
    ).optional,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue'
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.CloseParen
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([_openParen, dimension, op, eq, key, _closeParen]) => {
      // reversed inequality: (1250px > width) becomes max-width
      const finalKey = op === '>' ? `max-${key}` : `min-${key}`;
      const adjustedDimension = adjustDimension(dimension, op, eq, true);
      return {
        type: 'pair',
        key: finalKey,
        value: adjustedDimension,
      };
    });

// combine both inequality forms
const combinedInequalityParser: TokenParser<MediaRulePair> = TokenParser.oneOf(
  mediaInequalityRuleParser,
  mediaInequalityRuleParserReversed
);

const doubleInequalityRuleParser: TokenParser<MediaAndRules> =
  TokenParser.sequence(
    TokenParser.tokens.OpenParen,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<'
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '='
    ).optional,
    TokenParser.tokens.Ident.map(
      (token) => token[4].value,
      '.stringValue'
    ).where((val) => val === 'width' || val === 'height'),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '>' || val === '<'
    ),
    TokenParser.tokens.Delim.map((token) => token[4].value).where(
      (val) => val === '='
    ).optional,
    TokenParser.tokens.Dimension.map((token) => token[4]),
    TokenParser.tokens.CloseParen
  )
    .separatedBy(TokenParser.tokens.Whitespace.optional)
    .map(([
      _openParen,
      lower,
      op,
      eq,
      key,
      op2,
      eq2,
      upper,
      _closeParen,
    ]) => {
      const lowerKey = op === '<' ? `min-${key}` : `max-${key}`;
      const upperKey = op2 === '<' ? `max-${key}` : `min-${key}`;
      const lowerValue = adjustDimension(lower, op, eq);
      const upperValue = adjustDimension(upper, op2, eq2);
      return {
        type: 'and',
        rules: [
          { type: 'pair', key: lowerKey, value: lowerValue },
          { type: 'pair', key: upperKey, value: upperValue },
        ],
      };
    });

const mediaAndRulesParser: TokenParser<MediaAndRules | MediaQueryRule> =
  TokenParser.oneOrMore(
    TokenParser.oneOf(
      mediaKeywordParser,
      () =>
        mediaOrRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        ),
      () =>
        mediaAndRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        ),
      notParser,
      doubleInequalityRuleParser,
      combinedInequalityParser,
      simplePairParser,
      mediaWordRuleParser
    )
  )
    .separatedBy(
      TokenParser.string('and').surroundedBy(TokenParser.tokens.Whitespace)
    )
    .where(<T>(rules: ReadonlyArray<T>): rules is ReadonlyArray<T> => rules.length > 1)
    .map((rules) => (rules.length === 1 ? rules[0] : { type: 'and', rules }));

const mediaOrRulesParser: TokenParser<MediaOrRules | MediaQueryRule> =
  TokenParser.oneOrMore(
    TokenParser.oneOf(
      mediaKeywordParser,
      () =>
        mediaOrRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        ),
      () =>
        mediaAndRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        ),
      notParser,
      doubleInequalityRuleParser,
      combinedInequalityParser,
      simplePairParser,
      mediaWordRuleParser
    )
  )
    .separatedBy(
      TokenParser.string('or').surroundedBy(TokenParser.tokens.Whitespace)
    )
    .where(<T>(rules: ReadonlyArray<T>): rules is ReadonlyArray<T> => rules.length > 1)
    .map((rules) => (rules.length === 1 ? rules[0] : { type: 'or', rules }));

export class MediaQuery {
  queries: MediaQueryRule;
  constructor(queries: MediaQueryRule) {
    this.queries = MediaQuery.normalize(queries);
  }
  toString(): string {
    return `@media ${this.#toString(this.queries, true)}`;
  }
  #toString(queries: MediaQueryRule, isTopLevel: boolean = false): string {
    switch (queries.type) {
      case 'media-keyword':
        const prefix = queries.not ? 'not ' : queries.only ? 'only ' : '';
        return prefix + queries.key;
      case 'word-rule':
        return `(${queries.keyValue})`;
      case 'pair': {
        let valueStr: string;
        if (Array.isArray(queries.value)) {
          valueStr = `${queries.value[0]} / ${queries.value[2]}`;
        } else if (typeof queries.value === 'string') {
          valueStr = queries.value;
        } else if (
          typeof queries.value === 'object' &&
          queries.value !== null &&
          typeof queries.value.toString === 'function'
        ) {
          // call toString and if it returns "[object Object]", fallback to dimension formatting
          const candidate = queries.value.toString();
          if (candidate === '[object Object]') {
            valueStr = `${queries.value.value}${queries.value.unit}`;
          } else {
            valueStr = candidate;
          }
        } else {
          valueStr = '';
        }
        return `(${queries.key}: ${valueStr})`;
      }
      case 'not':
        return queries.rule && (queries.rule.type === 'and' || queries.rule.type === 'or')
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
        '.stringValue'
      ).where((key) => key === 'not'),
      TokenParser.oneOf(
        () =>
          mediaOrRulesParser.surroundedBy(
            TokenParser.tokens.OpenParen,
            TokenParser.tokens.CloseParen
          ),
        () =>
          mediaAndRulesParser.surroundedBy(
            TokenParser.tokens.OpenParen,
            TokenParser.tokens.CloseParen
          ),
        notParser,
        combinedInequalityParser,
        simplePairParser,
        mediaWordRuleParser
      )
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_not, queries]) => queries);

    const normalRuleParser = TokenParser.oneOf(
      mediaAndRulesParser,
      mediaOrRulesParser,
      mediaKeywordParser,
      notParser,
      doubleInequalityRuleParser,
      combinedInequalityParser,
      simplePairParser,
      mediaWordRuleParser,
      () =>
        mediaOrRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        ),
      () =>
        mediaAndRulesParser.surroundedBy(
          TokenParser.tokens.OpenParen,
          TokenParser.tokens.CloseParen
        )
    );

    return TokenParser.sequence(
      TokenParser.tokens.AtKeyword.where(
        (token: TokenAtKeyword): token is TokenAtKeyword =>
          token[4].value === 'media'
      ),
      TokenParser.oneOrMore(
        TokenParser.oneOf(leadingNotParser, normalRuleParser)
      ).separatedBy(
        TokenParser.tokens.Comma.surroundedBy(
          TokenParser.tokens.Whitespace.optional
        )
      )
    )
      .separatedBy(TokenParser.tokens.Whitespace)
      .map(([_at, querySets]) => {
        const rule = querySets.length > 1 ? { type: 'or', rules: querySets } : querySets[0];
        return new MediaQuery(rule);
      });
  }
}
