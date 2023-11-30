/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

function getDistanceMin(
  d0: number,
  d1: number,
  d2: number,
  bx: number,
  ay: number,
): number {
  return d0 < d1 || d2 < d1
    ? d0 > d2
      ? d2 + 1
      : d0 + 1
    : bx === ay
      ? d1
      : d1 + 1;
}
/*
 * This a fork of Gustaf Andersson's levenshtein implmentation
 * https://github.com/gustf/js-levenshtein
 *
 * Includes a naive bailout using max distance for stopping early
 * to prevent slowing down the lint rule too much.
 *
 * It will return Infinity if it bails out early
 */
export default function getDistance(
  _a: string,
  _b: string,
  max: number,
): number {
  let a = _a;
  let b = _b;
  // returns Infinity if max is exceeded
  if (a === b) {
    return 0;
  }

  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let la = a.length;
  let lb = b.length;

  while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
    la--;
    lb--;
  }

  let offset = 0;

  while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb < 3) {
    return lb;
  }

  let x = 0;
  let y;
  let d0;
  let d1;
  let d2;
  let d3;
  let dd = Infinity;
  let dy;
  let ay;
  let bx0;
  let bx1;
  let bx2;
  let bx3;

  const vector = [];

  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  const len = vector.length - 1;

  for (; x < lb - 3; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = x += 4;
    if (dd > max) {
      return Infinity;
    }
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = getDistanceMin(dy, d0, d1, bx0, ay);
      d1 = getDistanceMin(d0, d1, d2, bx1, ay);
      d2 = getDistanceMin(d1, d2, d3, bx2, ay);
      dd = getDistanceMin(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  for (; x < lb; ) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    if (dd > max) {
      return Infinity;
    }
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = getDistanceMin(dy, d0, dd, bx0, vector[y + 1]);
      if (dd > max) {
        return Infinity;
      }
      d0 = dy;
    }
  }

  return dd;
}
