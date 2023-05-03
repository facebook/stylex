/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const VALUES_REG = /,(?![^(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;
const LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;

function isLength(v: string): boolean {
  return v === '0' || LENGTH_REG.test(v);
}

function toMaybeNum(v: string): number | string {
  if (!/px$/.test(v) && v !== '0') return v;
  const n = parseFloat(v);
  return !isNaN(n) ? n : v;
}

function parseValue(str: string) {
  const parts = str.split(PARTS_REG);
  const inset = parts.includes('inset');
  const last = parts.slice(-1)[0];
  const color = !isLength(last) ? last : null;

  const nums = parts
    .filter((n) => n !== 'inset')
    .filter((n) => n !== color)
    .map(toMaybeNum);

  const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

  return {
    inset,
    offsetX,
    offsetY,
    blurRadius,
    spreadRadius,
    color,
  };
}

type ParsedShadow = {
  inset: boolean,
  offsetX: number | string,
  offsetY: number | string,
  blurRadius: number | string,
  spreadRadius: number | string,
  color: string | null,
};

export function parseShadow(str: string): Array<ParsedShadow> {
  return str
    .split(VALUES_REG)
    .map((s) => s.trim())
    .map(parseValue);
}
