/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { tokenize } from '@csstools/css-tokenizer';
import { subtractAtRule } from './condition-at-rule';

// Build-only protocol. Encoding prevents quotes, braces, and comments in a
// constant from changing the boundary of the deferred condition.
export function deferCondition(
  source: string,
  excluded: $ReadOnlyArray<string>,
): string {
  return `@stylex-order "${encodeURIComponent(JSON.stringify([source, excluded]))}"`;
}

export function resolveDeferredConditions(
  css: string,
  resolve: (string) => string,
  onResolve: (string) => void,
): string {
  if (!css.includes('@stylex-order')) return css;
  const tokens = tokenize({ css });
  let result = '';
  let start = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token[0] !== 'at-keyword-token' || token[4].value !== 'stylex-order')
      continue;
    let j = i + 1;
    while (String(tokens[j]?.[0]) === 'whitespace-token') j++;
    const payload = tokens[j++];
    while (String(tokens[j]?.[0]) === 'whitespace-token') j++;
    if (payload?.[0] !== 'string-token' || tokens[j]?.[0] !== '{-token')
      throw new Error('Malformed deferred StyleX condition');
    const open = tokens[j++];
    let depth = 1;
    for (; j < tokens.length && depth > 0; j++) {
      const kind: string = String(tokens[j][0]);
      if (kind === '{-token') depth++;
      else if (kind === '}-token') depth--;
    }
    if (depth !== 0) throw new Error('Unclosed deferred StyleX condition');
    const close = tokens[j - 1];
    const decoded: mixed = JSON.parse(decodeURIComponent(payload[4].value));
    if (!Array.isArray(decoded) || decoded.length !== 2)
      throw new Error('Invalid deferred StyleX condition');
    const [rawSource, rawExcluded] = decoded;
    if (
      typeof rawSource !== 'string' ||
      !Array.isArray(rawExcluded) ||
      rawExcluded.some((s) => typeof s !== 'string')
    )
      throw new Error('Invalid deferred StyleX condition');
    const source = resolve(rawSource);
    const excluded = rawExcluded.map((s) => resolve(String(s)));
    if (source.startsWith('var(--'))
      throw new Error('Missing defineConsts value for a deferred condition');
    onResolve(source);
    const body = resolveDeferredConditions(
      css.slice(open[3] + 1, close[2]),
      resolve,
      onResolve,
    );
    // Emit valid but unsimplified CSS. A Lightning CSS visitor can reduce the
    // conditions once every constant and nested context is known.
    const resolved = subtractAtRule(source, excluded, false)
      .map((chain) =>
        chain.reduceRight((inner, atRule) => `${atRule}{${inner}}`, body),
      )
      .join('');
    result += css.slice(start, token[2]) + resolved;
    start = close[3] + 1;
    i = j - 1;
  }
  return result + css.slice(start);
}
