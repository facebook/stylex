/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { ValueWithDefault } from './util-types';
export type CSSSyntax =
  | '*'
  | '<length>'
  | '<number>'
  | '<percentage>'
  | '<length-percentage>'
  | '<color>'
  | '<image>'
  | '<url>'
  | '<integer>'
  | '<angle>'
  | '<time>'
  | '<resolution>'
  | '<transform-function>'
  | '<custom-ident>'
  | '<transform-list>';
type CSSSyntaxType = CSSSyntax;
interface ICSSType<_T extends string | number> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Angle<T extends string | 0> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Color<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Url<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Image<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Integer<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class LengthPercentage<T extends string | number>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Length<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Percentage<T extends string | number>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Num<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Resolution<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Time<T extends string | 0> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformFunction<T extends string>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformList<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export type CSSType<T extends null | string | number> =
  | (T extends (any extends Angle<infer R> ? R : never) ? Angle<T> : never)
  | (T extends (any extends Color<infer R> ? R : never) ? Color<T> : never)
  | (T extends (any extends Url<infer R> ? R : never) ? Url<T> : never)
  | (T extends (any extends Image<infer R> ? R : never) ? Image<T> : never)
  | (T extends (any extends Integer<infer R> ? R : never) ? Integer<T> : never)
  | (T extends (any extends LengthPercentage<infer R> ? R : never)
      ? LengthPercentage<T>
      : never)
  | (T extends (any extends Length<infer R> ? R : never) ? Length<T> : never)
  | (T extends (any extends Percentage<infer R> ? R : never)
      ? Percentage<T>
      : never)
  | (T extends (any extends Num<infer R> ? R : never) ? Num<T> : never)
  | (T extends (any extends Resolution<infer R> ? R : never)
      ? Resolution<T>
      : never)
  | (T extends (any extends Time<infer R> ? R : never) ? Time<T> : never)
  | (T extends (any extends TransformFunction<infer R> ? R : never)
      ? TransformFunction<T>
      : never)
  | (T extends (any extends TransformList<infer R> ? R : never)
      ? TransformList<T>
      : never);
