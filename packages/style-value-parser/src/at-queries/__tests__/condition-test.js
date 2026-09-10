/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { parseCondition, simplifyCondition, andConditions } from '../condition';
import {
  parseAtRule,
  simplifyAtRule,
  subtractAtRule,
} from '../condition-at-rule';
import { lastMediaQueryWinsTransform } from '../media-query-transform';

describe('condition simplification', () => {
  test.each([
    '@media (400px <= width <= 800px) and (not (min-width: 600px))',
    '@media (min-width: 400px) and (not (min-width: 900px))',
    '@media (min-width: 800px) and (not ((min-width: 600px) and (max-width: 1000px) and (min-height: 500px)))',
    '@media (min-width: 800px) and (max-width: 500px)',
    '@media (min-width: 800px) and (min-width: 400px) and (orientation: landscape)',
    '@media screen and (min-width: 800px)',
    '@media not screen and (min-width: 800px)',
    '@media (color), (color) and (monochrome)',
    '@media (not (not (color)))',
    '@media (min-width: 40em) and (not (min-width: 900px))',
    '@media (width > 799.99px) and (not (max-width: 900px))',
    '@media (future-feature: custom(1, 2)) and (not (color))',
    '@media (future-feature) or (not (future-feature))',
    '@supports (display: grid) and (not ((display: flex) or (display: grid)))',
    '@supports selector(:is(.a, .b)) and (not (font-format(woff2)))',
    '@supports (--custom: "and, not (or)") and (not (display: grid))',
    '@supports (display: grid) /* or */ and (not (display: flex))',
    '@container card (min-width: 400px) and (not (min-height: 500px))',
  ])('%s', (source) => {
    const result = simplifyAtRule(source);
    expect({ source, result }).toMatchSnapshot();
    expect(simplifyAtRule(result)).toBe(result);
  });

  test('a negated media-type conjunction keeps valid nested at-rule scopes', () => {
    expect(
      subtractAtRule('@media (min-width: 400px)', [
        '@media screen, (max-width: 300px)',
      ]),
    ).toMatchSnapshot();
  });

  test('nested leaves without defaults do not erase earlier fallbacks', () => {
    expect(
      lastMediaQueryWinsTransform({
        color: {
          default: 'black',
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': { '@media (min-height: 500px)': 'blue' },
        },
      }),
    ).toMatchSnapshot();
  });

  test('ordinary pseudo-classes use specificity without enum exclusions', () => {
    const style = {
      color: {
        default: 'black',
        ':hover': 'red',
        ':active': 'blue',
        '@supports (display: grid)': 'green',
        '@supports (display: flex)': 'purple',
        '@container card (width > 400px)': 'orange',
      },
    };
    const result = lastMediaQueryWinsTransform(style);
    expect(result).toMatchSnapshot();
    expect(result.color[':hover']).toBe('red');
    expect(JSON.stringify(result)).not.toContain(':not(:active)');
    expect(style.color['@supports (display: grid)']).toBe('green');
  });

  test('nested pseudos retain the earlier at-rule as a fallback', () => {
    expect(
      lastMediaQueryWinsTransform({
        color: {
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': { ':hover': 'blue' },
        },
      }),
    ).toMatchSnapshot();
  });

  test.each([
    '(color) and',
    '((color)',
    '(color) and (grid) or (monochrome)',
    '(color); x',
  ])('rejects malformed groups: %s', (source) => {
    expect(() => parseCondition(source)).toThrow();
  });

  test('parses long at-rule whitespace without ambiguous prefix scanning', () => {
    const whitespace = ' '.repeat(50000);
    expect(parseAtRule(`@media${whitespace}(color)`)).toEqual(
      parseAtRule('@media (color)'),
    );
    expect(() => parseAtRule(`@media${whitespace}`)).toThrow();
  });

  test('keeps long feature names opaque without repeated range scans', () => {
    const source = `(${'width'.repeat(10000)})`;
    expect(parseCondition(source)).toEqual({ type: 'atom', value: source });
  });

  test('expansion is bounded without losing the original expression', () => {
    const expression = andConditions(
      Array.from({ length: 12 }, (_, i) =>
        parseCondition(`(feature-${i}) or (other-${i})`),
      ),
    );
    expect(simplifyCondition(expression)).toBe(expression);
  });

  test('boolean rewrites preserve all input truth assignments', () => {
    const expressions = [
      '(a) and (not ((b) and (c)))',
      '(not ((a) or (b))) or ((a) and (c))',
      '((a) and (b)) or ((a) and (not (b)))',
    ];
    // Include unknown, using the CSS three-valued truth tables.
    const evaluate = (c, env) => {
      if (typeof c === 'boolean') return c;
      if (c.type === 'atom') return env[c.value];
      if (c.type === 'not') {
        const v = evaluate(c.value, env);
        return v == null ? null : !v;
      }
      const values = c.values.map((v) => evaluate(v, env));
      return c.type === 'and'
        ? values.includes(false)
          ? false
          : values.includes(null)
            ? null
            : true
        : values.includes(true)
          ? true
          : values.includes(null)
            ? null
            : false;
    };
    for (const source of expressions) {
      const parsed = parseCondition(source);
      const result = simplifyCondition(parsed);
      for (const a of [false, true, null])
        for (const b of [false, true, null])
          for (const c of [false, true, null]) {
            const env = { '(a)': a, '(b)': b, '(c)': c };
            expect(evaluate(result, env) === true).toBe(
              evaluate(parsed, env) === true,
            );
          }
    }
  });
});
