/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

/* eslint-disable default-case */
/* eslint-disable no-fallthrough */

/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function murmurhash2_32_gc(str: string, seed?: number = 0) {
  let l = str.length,
    h = seed ^ l,
    i = 0,
    k;

  while (l >= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 24;
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);

    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
        (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  }

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;

  return h >>> 0;
}

const hash = (str: string): string => murmurhash2_32_gc(str, 1).toString(36);

export default hash as (str: string) => string;

const base62Chars =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function toBase62(num: number) {
  let result = '';
  let _num = num;
  while (_num > 0) {
    const remainder = _num % 62;
    result = base62Chars[remainder] + result;
    _num = Math.floor(_num / 62);
  }
  return result;
}

export const createShortHash = (str: string): string =>
  toBase62(murmurhash2_32_gc(str, 1) % 62 ** 5);
