/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// A bunch of object utils with better Flow types

import { IncludedStyles } from '../stylex-include';

export function flattenObject(obj: {
  +[string]: IncludedStyles | string | { +[string]: string },
}): { [string]: string | IncludedStyles } {
  const result: { [string]: string | IncludedStyles } = {};
  for (const [key, value] of objEntries(obj)) {
    if (typeof value === 'string' || value == null) {
      result[key] = value;
    } else if (value instanceof IncludedStyles) {
      result[key] = value;
    } else {
      for (const [subKey, subValue] of objEntries(value)) {
        result[`${key}_${subKey}`] = subValue;
      }
    }
  }
  return result;
}

export function objEntries<Obj: { ... }>(
  obj: Obj
): Array<[$Keys<Obj>, Obj[$Keys<Obj>]]> {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push([key, obj[key]]);
  }
  return retVal;
}

export function objValues<Obj: { ... }>(obj: Obj): Array<Obj[$Keys<Obj>]> {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push(obj[key]);
  }
  return retVal;
}

export function objFromEntries<K: string | number, V>(
  entries: $ReadOnlyArray<[K, V]>
): { [K]: V } {
  const retVal = {};
  for (const [key, value] of entries) {
    retVal[key] = value;
  }
  return retVal;
}

export function objMapKeys<
  V,
  K1: string | number = string,
  K2: string | number = string
>(obj: { +[K1]: V }, mapper: (K1) => K2): { +[K2]: V } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => [mapper(key), value])
  );
}

export function objMapEntry<
  V,
  V2,
  K1: string | number = string,
  K2: string | number = string
>(obj: { +[K1]: V }, mapper: ([K1, V]) => [K2, V2]): { +[K2]: V2 } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => mapper([key, value]))
  );
}

export function objMap<V, V2, K: string | number = string>(
  obj: { +[K]: V },
  mapper: (V, K) => V2
): { +[K]: V2 } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => [key, mapper(value, key)])
  );
}

export class Pipe<T> {
  value: T;

  constructor(val: T) {
    this.value = val;
  }

  pipe<T2>(mapper: (T) => T2): Pipe<T2> {
    return new Pipe(mapper(this.value));
  }

  done(): T {
    return this.value;
  }

  static create(val: T): Pipe<T> {
    return new Pipe(val);
  }
}
