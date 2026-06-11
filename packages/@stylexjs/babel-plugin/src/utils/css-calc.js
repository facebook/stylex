/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const CSS_VAR_PATTERN = /^var\(--[\w-]+\)$/;

const CSS_DIMENSION_PATTERN = /^[-+]?(\d+(\.\d*)?|\.\d+)([a-zA-Z]{1,18}|%)?$/;

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

export function isCalcTerm(value: mixed): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  return (
    typeof value === 'string' &&
    (isCssVarOrCalc(value) || CSS_DIMENSION_PATTERN.test(value))
  );
}

function roundNumber(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function calcOperandToString(value: number | string): string {
  if (typeof value === 'number') {
    return String(roundNumber(value));
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
