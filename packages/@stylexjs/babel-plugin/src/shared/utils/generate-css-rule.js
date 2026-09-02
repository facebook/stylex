/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type { InjectableStyle, StyleXOptions } from '../common-types';
import { defaultOptions } from './default-options';

import generateLtr from '../physical-rtl/generate-ltr';
import generateRtl from '../physical-rtl/generate-rtl';
import { getPriority } from '@stylexjs/shared';

// Adjacent pseudo-class ranks are 1 apart, so the at-rules of a rule are summed
// and then divided down to stay below that gap. The highest at-rule rank is 300
// (`@container`), leaving room for three nested at-rules.
const AT_RULE_SCALE = 1000;

const THUMB_VARIANTS = [
  '::-webkit-slider-thumb',
  '::-moz-range-thumb',
  '::-ms-thumb',
];

function buildNestedCSSRule(
  className: string,
  decls: string,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  constRules: $ReadOnlyArray<string>,
): string {
  // Pseudo-elements (::before, ::after, etc.) must come after pseudo-classes
  // in the selector. e.g. `.class:hover::before` not `.class::before:hover`
  const { classes, elements } = pseudos.reduce(
    (acc, p) => {
      if (p === '::thumb') return acc;

      if (p.startsWith('::')) {
        acc.elements += p;
      } else {
        acc.classes += p;
      }
      return acc;
    },
    { classes: '', elements: '' },
  );

  const pseudo = classes + elements;
  const combinedAtRules = atRules.concat(constRules);

  // Bump specificity of stylex.when selectors
  const hasWhere = pseudo.includes(':where(');
  const extraClassForWhere = hasWhere ? `.${className}` : '';

  // At-rules add no specificity. Every rule for a property is emitted with the
  // same weight so that `priority` alone decides which one wins.
  let selector = `.${className}` + extraClassForWhere + pseudo;

  if (pseudos.includes('::thumb')) {
    selector = THUMB_VARIANTS.map((suffix) => selector + suffix).join(', ');
  }

  return combinedAtRules.reduce(
    (acc, atRule) => `${atRule}{${acc}}`,
    `${selector}{${decls}}`,
  );
}

export function generateCSSRule(
  className: string,
  key: string,
  value: string | $ReadOnlyArray<string>,
  pseudos: $ReadOnlyArray<string>,
  atRules: $ReadOnlyArray<string>,
  constRules: $ReadOnlyArray<string>,
  options: StyleXOptions = defaultOptions,
): InjectableStyle {
  const pairs: $ReadOnlyArray<[string, string]> = Array.isArray(value)
    ? value.map((eachValue) => [key, eachValue])
    : [[key, value]];

  const ltrPairs = pairs.map((pair) => generateLtr(pair, options));
  const ltrDecls = ltrPairs.map((pair) => pair.join(':')).join(';');

  const rtlDecls = pairs
    .map((pair) => generateRtl(pair, options))
    .filter(Boolean)
    .map((pair) => pair.join(':'))
    .join(';');

  const ltrRule = buildNestedCSSRule(
    className,
    ltrDecls,
    pseudos,
    atRules,
    constRules,
  );
  const rtlRule = !rtlDecls
    ? null
    : buildNestedCSSRule(className, rtlDecls, pseudos, atRules, constRules);

  const sumPriorities = (keys: $ReadOnlyArray<string>) =>
    keys.map(getPriority).reduce((a, b) => a + b, 0);

  // An at-rule refines a state rather than outranking it: `:active` has to beat
  // `:hover` even when the hover styles are nested in a media query. Scaling the
  // at-rules down leaves them to only break ties between rules that share the
  // same property and pseudo-classes.
  const priority =
    getPriority(key) +
    sumPriorities(pseudos) +
    (sumPriorities(atRules) + sumPriorities(constRules)) / AT_RULE_SCALE;

  return { priority, ltr: ltrRule, rtl: rtlRule };
}
