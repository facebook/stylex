/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

const LONG_VALUE_MIN_LENGTH = 80;
const INDENT = '  ';

type FunctionValue = {
  args: Array<string>,
  name: string,
  suffix: string,
};

export function isLongCssValue(value: string): boolean {
  return value.length >= LONG_VALUE_MIN_LENGTH;
}

function parseOuterFunction(value: string): ?FunctionValue {
  const trimmed = value.trim();
  const functionMatch = /^([_a-zA-Z-][_a-zA-Z0-9-]*)\(/.exec(trimmed);
  if (functionMatch == null || functionMatch[1].toLowerCase() === 'url') {
    return null;
  }

  const openIndex = functionMatch[0].length - 1;
  const commaIndexes = [];
  let closeIndex = -1;
  let comment = false;
  let curlyDepth = 0;
  let escaped = false;
  let parenDepth = 0;
  let quote = null;
  let squareDepth = 0;

  for (let index = openIndex; index < trimmed.length; index += 1) {
    const character = trimmed[index];
    const nextCharacter = trimmed[index + 1];

    if (comment) {
      if (character === '*' && nextCharacter === '/') {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote != null) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === '/' && nextCharacter === '*') {
      comment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '(') {
      parenDepth += 1;
      continue;
    }
    if (character === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) {
        closeIndex = index;
        break;
      }
      continue;
    }
    if (character === '[') squareDepth += 1;
    else if (character === ']') squareDepth -= 1;
    else if (character === '{') curlyDepth += 1;
    else if (character === '}') curlyDepth -= 1;
    else if (
      character === ',' &&
      parenDepth === 1 &&
      squareDepth === 0 &&
      curlyDepth === 0
    ) {
      commaIndexes.push(index);
    }
  }

  if (closeIndex === -1) return null;
  const rawSuffix = trimmed.slice(closeIndex + 1).trim();
  if (rawSuffix !== '' && !/^!important$/i.test(rawSuffix)) return null;

  const args = [];
  let argStart = openIndex + 1;
  for (const commaIndex of commaIndexes) {
    args.push(trimmed.slice(argStart, commaIndex).trim());
    argStart = commaIndex + 1;
  }
  args.push(trimmed.slice(argStart, closeIndex).trim());
  if (args.some((arg) => arg === '')) return null;

  return {
    args,
    name: functionMatch[1],
    suffix: rawSuffix === '' ? '' : ` ${rawSuffix}`,
  };
}

function prettyPrintFunction(
  value: string,
  depth: number,
  maxLineLength: number,
): ?string {
  const parsed = parseOuterFunction(value);
  if (parsed == null) return null;

  const indent = INDENT.repeat(depth);
  const childIndent = INDENT.repeat(depth + 1);
  const args = parsed.args.map((arg) => {
    const nested =
      childIndent.length + arg.length >= maxLineLength
        ? prettyPrintFunction(arg, depth + 1, maxLineLength)
        : null;
    return `${childIndent}${nested ?? arg}`;
  });

  return `${parsed.name}(\n${args.join(',\n')}\n${indent})${parsed.suffix}`;
}

export function formatCssValueForDisplay(value: string): string {
  if (!isLongCssValue(value) || value.includes('\n')) return value;
  return prettyPrintFunction(value, 0, LONG_VALUE_MIN_LENGTH) ?? value;
}
