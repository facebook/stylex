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
  test('subtracts a range from a chained comparison', () => {
    const source =
      '@media (400px <= width <= 800px) and (not (min-width: 600px))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (min-width: 400px) and (max-width: 599.99px)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('bounds an earlier minimum width', () => {
    const source = '@media (min-width: 400px) and (not (min-width: 900px))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (min-width: 400px) and (max-width: 899.99px)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('negates every term of a nested conjunction', () => {
    const source =
      '@media (min-width: 800px) and (not ((min-width: 600px) and (max-width: 1000px) and (min-height: 500px)))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (min-width: 1000.01px), (min-width: 800px) and (max-height: 499.99px)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('removes contradictory width bounds', () => {
    const source = '@media (min-width: 800px) and (max-width: 500px)';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot('"@media not all"');

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('keeps the strongest compatible width bound', () => {
    const source =
      '@media (min-width: 800px) and (min-width: 400px) and (orientation: landscape)';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (min-width: 800px) and (orientation: landscape)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves a positive media type', () => {
    const source = '@media screen and (min-width: 800px)';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media screen and (min-width: 800px)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('negates a media type and its whole condition', () => {
    const source = '@media not screen and (min-width: 800px)';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media not screen, (max-width: 799.99px)"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('absorbs a redundant query-list branch', () => {
    const source = '@media (color), (color) and (monochrome)';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot('"@media (color)"');

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('removes double negation', () => {
    const source = '@media (not (not (color)))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot('"@media (color)"');

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves bounds with incompatible units', () => {
    const source = '@media (min-width: 40em) and (not (min-width: 900px))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (min-width: 40em) and (not (min-width: 900px))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('normalizes exclusive width comparisons', () => {
    const source = '@media (width > 799.99px) and (not (max-width: 900px))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot('"@media (min-width: 900.01px)"');

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('keeps unknown function arguments intact', () => {
    const source = '@media (future-feature: custom(1, 2)) and (not (color))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (future-feature: custom(1, 2)) and (not (color))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves unknown-feature truth semantics', () => {
    const source = '@media (future-feature) or (not (future-feature))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@media (future-feature), (not (future-feature))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('simplifies supports condition exclusions', () => {
    const source =
      '@supports (display: grid) and (not ((display: flex) or (display: grid)))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@supports (display: grid) and (not ((display: flex) or (display: grid)))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves commas inside selector functions', () => {
    const source =
      '@supports selector(:is(.a, .b)) and (not (font-format(woff2)))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@supports selector(:is(.a, .b)) and (not font-format(woff2))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves condition keywords inside strings', () => {
    const source =
      '@supports (--custom: "and, not (or)") and (not (display: grid))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@supports (--custom: "and, not (or)") and (not (display: grid))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('ignores boolean operators inside comments', () => {
    const source =
      '@supports (display: grid) /* or */ and (not (display: flex))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@supports (display: grid) /* or */ and (not (display: flex))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('preserves container condition contexts', () => {
    const source =
      '@container card (min-width: 400px) and (not (min-height: 500px))';
    const result = simplifyAtRule(source);

    expect(result).toMatchInlineSnapshot(
      '"@container card (min-width: 400px) and (not (min-height: 500px))"',
    );

    expect(simplifyAtRule(result)).toBe(result);
  });

  test('a negated media-type conjunction keeps valid nested at-rule scopes', () => {
    expect(
      subtractAtRule('@media (min-width: 400px)', [
        '@media screen, (max-width: 300px)',
      ]),
    ).toMatchInlineSnapshot(`
      [
        [
          "@media (min-width: 400px)",
          "@media not screen",
        ],
      ]
    `);
  });

  test('nested leaves without defaults do not erase earlier fallbacks', () => {
    expect(
      lastMediaQueryWinsTransform({
        color: {
          default: 'black',
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': {
            '@media (min-height: 500px)': 'blue',
          },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "color": {
          "@media (min-width: 400px) and (max-width: 599.99px), (min-width: 400px) and (max-height: 499.99px)": "red",
          "@media (min-width: 600px)": {
            "@media (min-height: 500px)": "blue",
          },
          "default": "black",
        },
      }
    `);
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

    expect(result).toMatchInlineSnapshot(`
      {
        "color": {
          ":active": "blue",
          ":hover": "red",
          "@container card (width > 400px)": "orange",
          "@supports (display: flex)": "purple",
          "@supports (display: grid) and (not (display: flex))": "green",
          "default": "black",
        },
      }
    `);

    expect(result.color[':hover']).toBe('red');

    expect(JSON.stringify(result)).not.toContain(':not(:active)');

    expect(style.color['@supports (display: grid)']).toBe('green');
  });

  test('nested pseudos retain the earlier at-rule as a fallback', () => {
    expect(
      lastMediaQueryWinsTransform({
        color: {
          '@media (min-width: 400px)': 'red',
          '@media (min-width: 600px)': {
            ':hover': 'blue',
          },
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "color": {
          "@media (min-width: 400px)": "red",
          "@media (min-width: 600px)": {
            ":hover": "blue",
          },
        },
      }
    `);
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

    expect(parseCondition(source)).toEqual({
      type: 'atom',
      value: source,
    });
  });

  test('expansion is bounded without losing the original expression', () => {
    const expression = andConditions(
      Array.from(
        {
          length: 12,
        },
        (_, i) => parseCondition(`(feature-${i}) or (other-${i})`),
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
            const env = {
              '(a)': a,
              '(b)': b,
              '(c)': c,
            };
            expect(evaluate(result, env) === true).toBe(
              evaluate(parsed, env) === true,
            );
          }
    }
  });
});
