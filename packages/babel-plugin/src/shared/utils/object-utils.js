/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// A bunch of object utils with better Flow types

import type { CompiledStyles } from '../common-types';

// eslint-disable-next-line no-unused-vars
type AnyObject = { +[string]: mixed };

export function isPlainObject(obj: mixed): implies obj is AnyObject {
  return (
    typeof obj === 'object' &&
    obj != null &&
    !Array.isArray(obj) &&
    obj?.constructor === Object
  );
}

export function flattenObject(obj: CompiledStyles): {
  +[string]: null | string,
} {
  const result: { [string]: null | string } = {};
  for (const [key, value] of objEntries(obj)) {
    if (typeof value === 'string' || value == null) {
      result[key] = value;
    } else {
      for (const [subKey, subValue] of objEntries(value)) {
        result[`${key}_${subKey}`] = subValue;
      }
    }
  }
  return result;
}

type _ObjectEntries<Obj: { +[string]: mixed }> = {
  [Key in keyof Obj]: [Key, Obj[Key]],
};
type ObjectEntries<Obj: { +[string]: mixed }> = $Values<_ObjectEntries<Obj>>;

export function objEntries<Obj: { +[string]: mixed }>(
  obj: Obj,
): $ReadOnlyArray<ObjectEntries<Obj>> {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push([key, obj[key]]);
  }
  return retVal;
}

export function objValues<Obj: { +[string]: mixed }>(
  obj: Obj,
): $ReadOnlyArray<Obj[$Keys<Obj>]> {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push(obj[key]);
  }
  return retVal;
}

export function objFromEntries<K: string | number, V>(
  entries: $ReadOnlyArray<$ReadOnly<[K, V]>>,
): { [K]: V } {
  const retVal: { [K]: V } = {};
  for (const [key, value] of entries) {
    retVal[key] = value;
  }
  return retVal;
}

export function objMapKeys<V, K1: string = string, K2: string = string>(
  obj: { +[K1]: V },
  mapper: (K1) => K2,
): { +[K2]: V } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => [mapper(key), value]),
  );
}

export function objMapEntry<V, V2, K1: string = string, K2: string = string>(
  obj: { +[K1]: V },
  mapper: ($ReadOnly<[K1, V]>) => $ReadOnly<[K2, V2]>,
): { +[K2]: V2 } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => mapper([key, value])),
  );
}

export function objMap<V, V2, K: string = string>(
  obj: { +[K]: V },
  mapper: (V, K) => V2,
): { +[K]: V2 } {
  return objFromEntries(
    objEntries(obj).map(([key, value]) => [key, mapper(value, key)]),
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

// Function that sorts an array without mutating it and returns a new array
export const arraySort = <T>(
  arr: $ReadOnlyArray<T>,
  fn?: (T, T) => number,
): $ReadOnlyArray<T> => [...arr].sort(fn);

export const arrayEquals = <T>(
  arr1: $ReadOnlyArray<T>,
  arr2: $ReadOnlyArray<T>,
  equals: (T, T) => boolean = (a, b) => a === b,
): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (!equals(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};
