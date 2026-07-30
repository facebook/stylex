/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

import path from 'path';
import { transformSync } from '@babel/core';
import stylexPlugin from '../src/index';

function getRules(styles) {
  return rulesFrom(
    `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({ root: ${styles} });
    `,
  );
}

// Media queries declared with `defineConsts` reach the rule as `var(--hash)`
// placeholders rather than as `@media` keys.
function getRulesWithConsts(styles) {
  return rulesFrom(
    `
      import * as stylex from '@stylexjs/stylex';
      import { breakpoints } from './constants.stylex';
      const styles = stylex.create({ root: ${styles} });
    `,
    {
      filename: path.join(__dirname, '__fixtures__/main.stylex.js'),
      unstable_moduleResolution: {
        rootDir: path.join(__dirname, '__fixtures__'),
        type: 'commonJS',
      },
    },
  );
}

function rulesFrom(source, { filename, ...opts } = {}) {
  const { metadata } = transformSync(source, {
    filename,
    parserOpts: { flow: 'all' },
    babelrc: false,
    plugins: [[stylexPlugin, opts]],
  });

  return metadata.stylex.map(([className, { ltr }, priority]) => ({
    className,
    ltr,
    priority,
    selector: selectorOf(ltr),
  }));
}

// The innermost selector, unwrapping any at-rules it is nested in.
function selectorOf(ltr) {
  const match = /(?:^|\{)([^{}]+)\{[^{}]*\}\}*$/.exec(ltr);
  if (match == null) {
    throw new Error(`Could not find a selector in: ${ltr}`);
  }
  return match[1];
}

// Class-level specificity. Every generated selector is a chain of classes and
// pseudo-classes, both of which count for the same specificity slot.
function specificity(selector) {
  const classes = selector.match(/\.[\w-]+/g) ?? [];
  const pseudoClasses = selector.match(/(?<!:):[\w-]+/g) ?? [];
  return classes.length + pseudoClasses.length;
}

// The rule the browser would apply: higher specificity wins, and rules of equal
// specificity are decided by insertion order, which follows `priority`.
function cascadeWinner(a, b) {
  if (specificity(a.selector) !== specificity(b.selector)) {
    return specificity(a.selector) > specificity(b.selector) ? a : b;
  }
  return a.priority > b.priority ? a : b;
}

function wins(winner, loser) {
  expect(cascadeWinner(winner, loser).ltr).toBe(winner.ltr);
}

function ruleMatching(rules, substring) {
  const found = rules.filter((rule) => rule.ltr.includes(substring));
  if (found.length !== 1) {
    throw new Error(
      `Expected exactly one rule matching "${substring}", got ${found.length}`,
    );
  }
  return found[0];
}

describe('@stylexjs/babel-plugin', () => {
  describe('[transform] conditional style precedence', () => {
    test(':active wins over :hover nested in a media query', () => {
      const rules = getRules(`{
        backgroundImage: {
          default: null,
          ':hover': {
            '@media (hover: hover)': 'red',
          },
          ':active': 'blue',
        },
      }`);

      wins(ruleMatching(rules, ':active'), ruleMatching(rules, ':hover'));
    });

    test('pseudo-class state outranks at-rules', () => {
      const rules = getRules(`{
        color: {
          default: 'black',
          '@media (min-width: 800px)': 'grey',
          ':hover': {
            default: 'blue',
            '@media (min-width: 800px)': 'navy',
          },
          ':active': {
            default: 'red',
            '@media (min-width: 800px)': 'maroon',
          },
        },
      }`);

      const ordered = [
        ruleMatching(rules, 'color:black'),
        ruleMatching(rules, 'color:grey'),
        ruleMatching(rules, 'color:blue'),
        ruleMatching(rules, 'color:navy'),
        ruleMatching(rules, 'color:red'),
        ruleMatching(rules, 'color:maroon'),
      ];

      for (let i = 1; i < ordered.length; i++) {
        wins(ordered[i], ordered[i - 1]);
      }
    });

    test('at-rules break ties within a single state', () => {
      const rules = getRules(`{
        color: {
          default: 'black',
          '@supports (color: red)': 'grey',
          '@media (min-width: 800px)': 'blue',
          '@container (min-width: 800px)': 'red',
        },
      }`);

      const ordered = [
        ruleMatching(rules, 'color:black'),
        ruleMatching(rules, 'color:grey'),
        ruleMatching(rules, 'color:blue'),
        ruleMatching(rules, 'color:red'),
      ];

      for (let i = 1; i < ordered.length; i++) {
        wins(ordered[i], ordered[i - 1]);
      }
    });

    test(':active wins over :hover nested in a media query constant', () => {
      const rules = getRulesWithConsts(`{
        backgroundImage: {
          default: null,
          ':hover': {
            [breakpoints.small]: 'red',
          },
          ':active': 'blue',
        },
      }`);

      wins(ruleMatching(rules, ':active'), ruleMatching(rules, ':hover'));
    });

    test('a media query constant cannot outrank a higher pseudo-class', () => {
      const rules = getRulesWithConsts(`{
        color: {
          ':checked': {
            [breakpoints.small]: 'red',
          },
          ':valid': 'blue',
        },
      }`);

      wins(ruleMatching(rules, 'color:blue'), ruleMatching(rules, 'color:red'));
    });

    test('nested at-rules win over the states they refine', () => {
      const rules = getRules(`{
        color: {
          default: 'black',
          '@media (min-width: 800px)': {
            default: 'blue',
            '@supports (color: red)': 'navy',
          },
        },
      }`);

      wins(
        ruleMatching(rules, 'color:navy'),
        ruleMatching(rules, 'color:blue'),
      );
    });
  });
});
