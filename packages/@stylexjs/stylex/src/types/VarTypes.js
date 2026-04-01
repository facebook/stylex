/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { ValueWithDefault } from './StyleXUtils';

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
type InnerValue = null | string | number;

interface ICSSType<+_T extends InnerValue> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Angle<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Color<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Url<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Image<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Integer<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class LengthPercentage<+T extends InnerValue>
  implements ICSSType<T>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Length<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Percentage<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Num<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Resolution<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Time<+T extends InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformFunction<+T extends InnerValue>
  implements ICSSType<T>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformList<+T extends InnerValue>
  implements ICSSType<T>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}

export type CSSType<+T extends InnerValue> =
  | Angle<T>
  | Color<T>
  | Url<T>
  | Image<T>
  | Integer<T>
  | LengthPercentage<T>
  | Length<T>
  | Percentage<T>
  | Num<T>
  | Resolution<T>
  | Time<T>
  | TransformFunction<T>
  | TransformList<T>;
