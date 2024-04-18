/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// import type { Color as ColorType } from './stylex-types-color';

// We want all in one file?
// option 1, create interface an implement it in the class
// why? All the types have a single base definition of props
// We want on type that defines CSS Types
// Option 2: Do a union type and make

// interface CSSType {
//   toString(): string;
// }

type NestedWithNumbers =
  | number
  | string
  | $ReadOnly<{
      default: NestedWithNumbers,
      [string]: NestedWithNumbers,
    }>;

type ValueWithDefault =
  | string
  | $ReadOnly<{
      default: ValueWithDefault,
      [string]: ValueWithDefault,
    }>;

type CSSSyntax =
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

class BaseCSSType {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType;
  constructor(value: ValueWithDefault) {
    this.value = value;
  }
}
export interface CSSType<+_T: string | number = string | number> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType;
}

export const isCSSType = (value: mixed): value is CSSType<string | number> => {
  return (
    value instanceof BaseCSSType &&
    value.value != null &&
    typeof value.syntax === 'string'
  );
};

type AngleValue = string;
export class Angle<+T: AngleValue> extends BaseCSSType implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<angle>';
  static +syntax: CSSSyntaxType = '<angle>';

  static create<T: AngleValue = AngleValue>(value: ValueWithDefault): Angle<T> {
    return new Angle(value);
  }
}
export const angle: <T: AngleValue = AngleValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => Angle<T> = Angle.create;

type ColorValue = string;
export class Color<+T: ColorValue> extends BaseCSSType implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<color>';

  static create<T: ColorValue = ColorValue>(value: ValueWithDefault): Color<T> {
    return new Color(value);
  }
}
export const color: <T: ColorValue = ColorValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => Color<T> = Color.create;

type URLValue = string;

export class Url<+T: URLValue> extends BaseCSSType implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<url>';

  static create<T: URLValue = URLValue>(value: ValueWithDefault): Url<T> {
    return new Url(value);
  }
}
export const url: <T: URLValue = URLValue>(value: ValueWithDefault) => Url<T> =
  // $FlowIgnore[method-unbinding]
  Url.create;

type ImageValue = string;

export class Image<+T: ImageValue> extends Url<T> implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<image>';

  constructor(value: ValueWithDefault) {
    super(value);
    this.value = value;
  }

  static create<T: ImageValue = ImageValue>(value: ValueWithDefault): Image<T> {
    return new Image(value);
  }
}
export const image: <T: ImageValue = ImageValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => Image<T> = Image.create;

type IntegerValue = number;

export class Integer<+T: IntegerValue>
  extends BaseCSSType
  implements CSSType<T>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<integer>';

  static create<T: IntegerValue = IntegerValue>(value: T): Integer<T> {
    return new Integer(convertNumberToStringUsing(String, '0')(value));
  }
}
export const integer: <T: IntegerValue = IntegerValue>(value: T) => Integer<T> =
  // $FlowIgnore[method-unbinding]
  Integer.create;

type LengthPercentageValue = string;

export class LengthPercentage<+_T: LengthPercentageValue>
  extends BaseCSSType
  implements CSSType<string>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<length-percentage>';

  static createLength<_T: LengthPercentageValue | number>(
    value: ValueWithDefault,
  ): LengthPercentage<string> {
    return new LengthPercentage(convertNumberToLength(value));
  }

  static createPercentage<_T: LengthPercentageValue | number>(
    value: ValueWithDefault,
  ): LengthPercentage<string> {
    return new LengthPercentage(convertNumberToPercentage(value));
  }
}
export const lengthPercentage: <_T: LengthPercentageValue | number>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => LengthPercentage<string> = LengthPercentage.createLength;

type LengthValue = number | string;

export class Length<+_T: LengthValue>
  extends LengthPercentage<string>
  implements CSSType<string>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<length>';

  static create<T: LengthValue = LengthValue>(
    value: NestedWithNumbers,
  ): Length<T> {
    return new Length(convertNumberToLength(value));
  }
}
export const length: <T: LengthValue = LengthValue>(
  value: NestedWithNumbers,
  // $FlowIgnore[method-unbinding]
) => Length<T> = Length.create;

type PercentageValue = string | number;

export class Percentage<+_T: PercentageValue>
  extends LengthPercentage<string>
  implements CSSType<string>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<percentage>';

  static create<T: PercentageValue = PercentageValue>(
    value: NestedWithNumbers,
  ): Percentage<T> {
    return new Percentage(convertNumberToPercentage(value));
  }
}
export const percentage: <T: PercentageValue = PercentageValue>(
  value: NestedWithNumbers,
  // $FlowIgnore[method-unbinding]
) => Percentage<T> = Percentage.create;

type NumberValue = number;

export class Num<+T: NumberValue> extends BaseCSSType implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<number>';

  static create<T: NumberValue = NumberValue>(
    value: NestedWithNumbers,
  ): Num<T> {
    return new Num(convertNumberToBareString(value));
  }
}
export const number: <T: NumberValue = NumberValue>(
  value: NestedWithNumbers,
  // $FlowIgnore[method-unbinding]
) => Num<T> = Num.create;

type ResolutionValue = string | 0;

export class Resolution<+T: ResolutionValue>
  extends BaseCSSType
  implements CSSType<T>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<resolution>';

  static create<T: ResolutionValue = ResolutionValue>(
    value: ValueWithDefault,
  ): Resolution<T> {
    return new Resolution(value);
  }
}
export const resolution: <T: ResolutionValue = ResolutionValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => Resolution<T> = Resolution.create;

type TimeValue = string | 0;

export class Time<+T: TimeValue> extends BaseCSSType implements CSSType<T> {
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<time>';

  static create<T: TimeValue = TimeValue>(value: ValueWithDefault): Time<T> {
    return new Time(value);
  }
}
export const time: <T: TimeValue = TimeValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => Time<T> = Time.create;

type TransformFunctionValue = string;

export class TransformFunction<+T: TransformFunctionValue>
  extends BaseCSSType
  implements CSSType<T>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<transform-function>';

  static create<T: TransformFunctionValue = TransformFunctionValue>(
    value: ValueWithDefault,
  ): TransformFunction<T> {
    return new TransformFunction(value);
  }
}
export const transformFunction: <
  T: TransformFunctionValue = TransformFunctionValue,
>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => TransformFunction<T> = TransformFunction.create;

type TransformListValue = string;

export class TransformList<T: TransformListValue>
  extends BaseCSSType
  implements CSSType<T>
{
  +value: ValueWithDefault;
  +syntax: CSSSyntaxType = '<transform-list>';

  static create<T: TransformListValue = TransformListValue>(
    value: ValueWithDefault,
  ): TransformList<T> {
    return new TransformList(value);
  }
}
export const transformList: <T: TransformListValue = TransformListValue>(
  value: ValueWithDefault,
  // $FlowIgnore[method-unbinding]
) => TransformList<T> = TransformList.create;

const convertNumberToStringUsing =
  (
    transformNumber: (number) => string,
    defaultStr: string,
  ): ((NestedWithNumbers) => ValueWithDefault) =>
  (value: NestedWithNumbers): ValueWithDefault => {
    if (typeof value === 'number') {
      return transformNumber(value);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      const val = value;
      const result: { [string]: ValueWithDefault } = {};

      for (const key of Object.keys(val)) {
        result[key] = convertNumberToStringUsing(
          transformNumber,
          defaultStr,
        )(val[key]);
      }

      return result;
    }
    return value;
  };

const convertNumberToBareString: (
  value: NestedWithNumbers,
) => ValueWithDefault = convertNumberToStringUsing(
  (value) => String(value),
  '0',
);

const convertNumberToLength: (value: NestedWithNumbers) => ValueWithDefault =
  convertNumberToStringUsing(
    (value) => (value === 0 ? '0' : `${value}px`),
    '0px',
  );

const convertNumberToPercentage: (
  value: NestedWithNumbers,
) => ValueWithDefault = convertNumberToStringUsing(
  (value) => (value === 0 ? '0' : `${value * 100}%`),
  '0',
);
