/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { planEnumConditions } from '../enum-condition-negation';
import { enumConditionSelector } from '../enum-condition-path';
import { lastMediaQueryWinsTransform } from 'style-value-parser';

const base = {
  value: 'comfortable',
  conditions: [],
};

const snapshot = (branches) =>
  planEnumConditions([base, ...branches]).map((branch) => ({
    ...branch,
    paths: branch.paths.map((p) => ({
      ...p,
      selector: enumConditionSelector(p.selector),
    })),
  }));

describe('enum-only condition negation', () => {
  test('active excludes hover even though it has higher StyleX precedence', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: [':hover'],
        },
        {
          value: 'spacious',
          conditions: [':active'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:hover):not(:where(:active))",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:active)",
            },
          ],
          "value": "spacious",
        },
      ]
    `);
  });

  test('pseudo precedence is independent of source key order', () => {
    const hover = {
      value: 'compact',
      conditions: [':hover'],
    };

    const active = {
      value: 'spacious',
      conditions: [':active'],
    };

    expect(snapshot([active, hover])).toEqual(snapshot([hover, active]));
  });

  test('negates the whole nested conjunction', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: [':hover'],
        },
        {
          value: 'spacious',
          conditions: [':active', '@media (min-width: 600px)'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:hover):not(:where(:active))",
            },
            {
              "atRules": [
                "@media (max-width: 599.99px)",
              ],
              "selector": ":where(:hover)",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@media (min-width: 600px)",
              ],
              "selector": ":where(:active)",
            },
          ],
          "value": "spacious",
        },
      ]
    `);
  });

  test('overlapping and disjoint media ranges', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: ['@media (min-width: 400px)'],
        },
        {
          value: 'spacious',
          conditions: ['@media (min-width: 900px)'],
        },
        {
          value: 'compact',
          conditions: ['@media print'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@media (min-width: 400px) and (max-width: 899.99px)",
              ],
              "selector": "",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@media (min-width: 900px)",
                "@media not print",
              ],
              "selector": "",
            },
          ],
          "value": "spacious",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@media print",
              ],
              "selector": "",
            },
          ],
          "value": "compact",
        },
      ]
    `);
  });

  test('container and unknown-media branches use positive resets', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: [':hover'],
        },
        {
          value: 'spacious',
          conditions: ['@container card (min-width: 600px)'],
        },
        {
          value: 'roomy',
          conditions: ['@media (future-feature)'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:hover)",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
            "compact",
          ],
          "paths": [
            {
              "atRules": [
                "@media (future-feature)",
              ],
              "selector": "",
            },
          ],
          "value": "roomy",
        },
        {
          "clear": [
            "comfortable",
            "compact",
            "roomy",
          ],
          "paths": [
            {
              "atRules": [
                "@container card (min-width: 600px)",
              ],
              "selector": "",
            },
          ],
          "value": "spacious",
        },
      ]
    `);
  });

  test('nested selectors can exclude within a shared container', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: ['@container card (min-width: 600px)', ':hover'],
        },
        {
          value: 'spacious',
          conditions: ['@container card (min-width: 600px)', ':active'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@container card (min-width: 600px)",
              ],
              "selector": ":where(:hover):not(:where(:active))",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [
                "@container card (min-width: 600px)",
              ],
              "selector": ":where(:active)",
            },
          ],
          "value": "spacious",
        },
      ]
    `);
  });

  test('same-state branches need no exclusions', () => {
    expect(
      snapshot([
        {
          value: 'compact',
          conditions: [':hover'],
        },
        {
          value: 'compact',
          conditions: [':active'],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "clear": [],
          "paths": [
            {
              "atRules": [],
              "selector": "",
            },
          ],
          "value": "comfortable",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:hover)",
            },
          ],
          "value": "compact",
        },
        {
          "clear": [
            "comfortable",
          ],
          "paths": [
            {
              "atRules": [],
              "selector": ":where(:active)",
            },
          ],
          "value": "compact",
        },
      ]
    `);
  });

  test('regular styles retain their simpler selector output', () => {
    expect(
      lastMediaQueryWinsTransform({
        color: {
          default: 'black',
          ':hover': 'red',
          ':active': 'blue',
        },
      }),
    ).toEqual({
      color: {
        default: 'black',
        ':hover': 'red',
        ':active': 'blue',
      },
    });
  });

  test('exactly one state survives every combination of pseudo-classes', () => {
    const branches = planEnumConditions([
      base,
      {
        value: 'compact',
        conditions: [':hover'],
      },
      {
        value: 'spacious',
        conditions: [':active'],
      },
      {
        value: 'roomy',
        conditions: [':hover', ':focus'],
      },
    ]);

    const matches = (condition, env) => {
      if (typeof condition === 'boolean') return condition;
      if (condition.type === 'atom') return env[condition.value];
      if (condition.type === 'not') return !matches(condition.value, env);
      const values = condition.values.map((c) => matches(c, env));
      return condition.type === 'and'
        ? values.every(Boolean)
        : values.some(Boolean);
    };

    for (const hover of [false, true])
      for (const active of [false, true])
        for (const focus of [false, true]) {
          const selected = new Set();
          const env = {
            ':hover': hover,
            ':active': active,
            ':focus': focus,
          };
          for (const branch of branches)
            if (branch.paths.some((p) => matches(p.selector, env))) {
              branch.clear.forEach((v) => selected.delete(v));
              selected.add(branch.value);
            }

          expect([...selected]).toEqual([
            hover && focus
              ? 'roomy'
              : active
                ? 'spacious'
                : hover
                  ? 'compact'
                  : 'comfortable',
          ]);
        }
  });
});
