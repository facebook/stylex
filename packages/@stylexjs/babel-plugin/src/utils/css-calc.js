/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import parser from 'postcss-value-parser';
import { roundForCss } from '../shared/utils/transform-value';

// Custom property names may contain any character except ')' — including
// unicode identifiers, which `defineVars`/`defineConsts` pass through
// verbatim for keys that start with '--'.
const CSS_VAR_PATTERN = /^var\(--[^)]+\)$/;

const CSS_UNITS: Set<string> = new Set([
  // <length>
  'px',
  'em',
  'rem',
  'ex',
  'ch',
  'cap',
  'ic',
  'lh',
  'rlh',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'vb',
  'vi',
  'svw',
  'svh',
  'lvw',
  'lvh',
  'dvw',
  'dvh',
  'cm',
  'mm',
  'q',
  'in',
  'pt',
  'pc',
  // <angle>
  'deg',
  'grad',
  'rad',
  'turn',
  // <time>
  's',
  'ms',
  // <frequency>
  'hz',
  'khz',
  // <resolution>
  'dpi',
  'dpcm',
  'dppx',
  'x',
  // grid
  'fr',
  // <percentage>
  '%',
]);

function isBalancedCalc(value: string): boolean {
  if (!value.startsWith('calc(') || !value.endsWith(')')) {
    return false;
  }
  let depth = 0;
  for (let i = 4; i < value.length; i++) {
    const char = value[i];
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      // The opening paren of `calc(` must close at the very last character,
      // so strings like `calc(1) + calc(2)` are not a single calc term.
      if (depth === 0) {
        return i === value.length - 1;
      }
    }
  }
  return false;
}

export function isCssVarOrCalc(value: mixed): boolean {
  return (
    typeof value === 'string' &&
    (CSS_VAR_PATTERN.test(value) || isBalancedCalc(value))
  );
}

// A finite number or a var()/calc() reference. The only operand kinds
// allowed for '+', where a unit string would be ambiguous with the
// space-separated list concatenation that `+` also expresses.
export function isStrictCalcTerm(value: mixed): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  return isCssVarOrCalc(value);
}

// A strict calc term, or a numeric string with a known CSS unit ('10px',
// '1.5rem', '50%'). Used for '-', '*', and '/', which have no
// string-concatenation reading to preserve.
export function isCalcTerm(value: mixed): boolean {
  if (isStrictCalcTerm(value)) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  const parsed = parser.unit(value);
  if (parsed === false || parsed.number === '') {
    return false;
  }
  const unit = parsed.unit.toLowerCase();
  return unit === '' || CSS_UNITS.has(unit);
}

function calcOperandToString(value: number | string): string {
  if (typeof value === 'number') {
    return String(roundForCss(value));
  }
  if (isBalancedCalc(value)) {
    // Strip nested `calc(...)` down to plain parens to keep the output flat.
    return `(${value.slice(5, -1)})`;
  }
  return value;
}

export function buildBinaryCalc(
  left: number | string,
  operator: string,
  right: number | string,
): string {
  return `calc(${calcOperandToString(left)} ${operator} ${calcOperandToString(right)})`;
}

export function buildUnaryMinusCalc(arg: number | string): string {
  return `calc(-1 * ${calcOperandToString(arg)})`;
}
