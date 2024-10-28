/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import convertFontSizeToRem from './normalizers/font-size-px-to-rem';
import normalizeLeadingZero from './normalizers/leading-zero';
import normalizeQuotes from './normalizers/quotes';
import normalizeTimings from './normalizers/timings';
import normalizeWhitespace from './normalizers/whitespace';
import normalizeZeroDimensions from './normalizers/zero-dimensions';

import detectUnclosedFns from './normalizers/detect-unclosed-fns';
import parser from 'postcss-value-parser';
import convertCamelCaseValues from './normalizers/convert-camel-case-values';
import type { StyleXOptions } from '../common-types';
import { transform } from 'lightningcss';
import dashify from './dashify';
import type {
  Declaration,
  PropertyId,
  TokenOrValue,
} from 'lightningcss/node/ast';

// `Timings` should be before `LeadingZero`, because it
// changes 500ms to 0.5s, then `LeadingZero` makes it .5s
const normalizers = [
  detectUnclosedFns,
  normalizeWhitespace,
  normalizeTimings,
  normalizeZeroDimensions,
  normalizeLeadingZero,
  normalizeQuotes,
  convertCamelCaseValues,
  // convertFontSizeToRem,
];

const parseCache: { [string]: ?Map<string, string> } = {};

export default function normalizeValue(
  value: string,
  key: string,
  { useRemForFontSize }: StyleXOptions,
): string {
  const cachedValue = parseCache[key]?.get(value);
  if (cachedValue != null) {
    return cachedValue;
  }
  const cssKey = dashify(key);
  try {
    const cssString = `.foo { ${cssKey}: ${value}; }`;
    const { code } = transform({
      filename: 'style.css',
      code: Buffer.from(cssString),
      minify: true,
      sourceMap: false,
      visitor: {
        Declaration(decl: Declaration) {
          if (decl.property === 'transition-property') {
            const value: Array<PropertyId> = decl.value;

            const newValue = value.map((propId: PropertyId): PropertyId => {
              // $FlowFixMe[incompatible-type]
              propId.property = dashify(propId.property);
              return propId;
            });
            return {
              ...decl,
              value: newValue,
            };
          }
          if (decl.property === 'custom' && decl.value.name === 'will-change') {
            const values: Array<TokenOrValue> = decl.value.value;
            const newValues = values.map(
              (maybeIdent: TokenOrValue): TokenOrValue => {
                if (
                  maybeIdent.type === 'token' &&
                  maybeIdent.value.type === 'ident'
                ) {
                  return {
                    ...maybeIdent,
                    value: {
                      ...maybeIdent.value,
                      value: dashify(maybeIdent.value.value),
                    },
                  };
                }
                return maybeIdent;
              },
            );
            decl.value.value = newValues;
            return decl;
          }
        },
      },
    });

    const codeStr = code.toString();

    const propStr = `${cssKey}:`;

    let normalized = codeStr
      .slice(codeStr.lastIndexOf(propStr) + propStr.length)
      .trim();
    if (normalized.endsWith('}')) {
      normalized = normalized.slice(0, -1);
    }
    if (normalized.endsWith(';')) {
      normalized = normalized.slice(0, -1);
    }

    const map = parseCache[cssKey] ?? new Map();
    map.set(value, normalized);
    parseCache[cssKey] = map;

    return normalized;
  } catch (e) {
    console.error('Error while parsing', cssKey, value, e);
  }

  if (value == null) {
    return value;
  }
  const parsedAST = parser(value);
  const relevantNormalizers = useRemForFontSize
    ? [...normalizers, convertFontSizeToRem]
    : normalizers;
  return relevantNormalizers
    .reduce((ast, fn) => fn(ast, key), parsedAST)
    .toString();
}
