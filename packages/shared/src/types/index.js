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
// option 1, creat interface an implement it in the class
// why? All the types have a single base definition of props
// We want on type that defines CSS Types
// Option 2: Do a union type and make

// interface ICSSType {
//   toString(): string;
// }

type ValueWithDefault<+T> =
  | T
  | $ReadOnly<{
      default: T,
      [string]: ValueWithDefault<T>,
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

type CSSSyntaxType = CSSSyntax | $ReadOnlyArray<CSSSyntax>;

export class CSSType {}

export interface ICSSType<+T: string | number> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType;
}

type AnguleValue = string;
export class Angle<+T: AnguleValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<angle>';
  static +syntax: CSSSyntaxType = '<angle>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: AnguleValue = AnguleValue>(
    value: ValueWithDefault<T>,
  ): Angle<T> {
    return new Angle(value);
  }
}
export const angle = Angle.create;

type ColorValue = string;
export class Color<+T: ColorValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<color>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: ColorValue = ColorValue>(
    value: ValueWithDefault<T>,
  ): Color<T> {
    return new Color(value);
  }
}
export const color = Color.create;

type URLValue = string;

export class Url<+T: URLValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<url>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: URLValue = URLValue>(value: ValueWithDefault<T>): Url<T> {
    return new Url(value);
  }
}
export const url = Url.create;

type ImageValue = string;

export class Image<+T: ImageValue> extends Url<T> implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<image>';

  constructor(value: ValueWithDefault<T>) {
    super(value);
    this.value = value;
  }

  static create<T: ImageValue = ImageValue>(
    value: ValueWithDefault<T>,
  ): Image<T> {
    return new Image(value);
  }
}
export const image = Image.create;

type IntegerValue = number;

export class Integer<+T: IntegerValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<integer>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: IntegerValue = IntegerValue>(value: T): Integer<T> {
    return new Integer(value);
  }
}
export const integer = Integer.create;

type LengthPercentageValue = string;

export class LengthPercentage<+T: LengthPercentageValue>
  extends CSSType
  implements ICSSType<string>
{
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<length-percentage>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static createLength<T: LengthPercentageValue | number>(
    value: ValueWithDefault<T>,
  ): LengthPercentage<string> {
    return new LengthPercentage(convertNumberToLength(value));
  }

  static createPercentage<T: LengthPercentageValue | number>(
    value: ValueWithDefault<T>,
  ): LengthPercentage<string> {
    return new LengthPercentage(convertNumberToPercentage(value));
  }
}
export const lengthPercentage = LengthPercentage.createLength;

type LengthValue = number | string;

export class Length<+T: LengthValue>
  extends LengthPercentage<string>
  implements ICSSType<string>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType = '<length>';

  constructor(value: ValueWithDefault<T>) {
    super(convertNumberToLength(value));
  }

  static create<T: LengthValue = LengthValue>(
    value: ValueWithDefault<T>,
  ): Length<T> {
    return new Length(value);
  }
}
export const length = Length.create;

type PercentageValue = string | number;

export class Percentage<+T: PercentageValue>
  extends LengthPercentage<string>
  implements ICSSType<string>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType = '<percentage>';

  constructor(value: ValueWithDefault<T>) {
    super(convertNumberToPercentage(value));
  }

  static create<T: PercentageValue = PercentageValue>(
    value: ValueWithDefault<T>,
  ): Percentage<T> {
    return new Percentage(value);
  }
}
export const percentage = Percentage.create;

type NumberValue = number;

export class Num<+T: NumberValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<number>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: NumberValue = NumberValue>(
    value: ValueWithDefault<T>,
  ): Num<T> {
    return new Num(value);
  }
}
export const number = Num.create;

type ResolutionValue = string | 0;

export class Resolution<+T: ResolutionValue>
  extends CSSType
  implements ICSSType<T>
{
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<resolution>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: ResolutionValue = ResolutionValue>(
    value: ValueWithDefault<T>,
  ): Resolution<T> {
    return new Resolution(value);
  }
}
export const resolution = Resolution.create;

type TimeValue = string | 0;

export class Time<+T: TimeValue> extends CSSType implements ICSSType<T> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<time>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: TimeValue = TimeValue>(value: ValueWithDefault<T>): Time<T> {
    return new Time(value);
  }
}
export const time = Time.create;

type TransformFunctionValue = string;

export class TransformFunction<+T: TransformFunctionValue>
  extends CSSType
  implements ICSSType<T>
{
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<transform-function>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: TransformFunctionValue = TransformFunctionValue>(
    value: ValueWithDefault<T>,
  ): TransformFunction<T> {
    return new TransformFunction(value);
  }
}
export const transformFunction = TransformFunction.create;

type TransformListValue = string;

export class TransformList<T: TransformListValue>
  extends CSSType
  implements ICSSType<T>
{
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType = '<transform-list>';

  constructor(value: ValueWithDefault<T>) {
    super();
    this.value = value;
  }

  static create<T: TransformListValue = TransformListValue>(
    value: ValueWithDefault<T>,
  ): TransformList<T> {
    return new TransformList(value);
  }
}
export const transformList = TransformList.create;

const convertNumberToStringUsing =
  (transformNumber: (number) => string, defaultStr: string) =>
  (value: ValueWithDefault<number | string>): ValueWithDefault<string> => {
    if (typeof value === 'number') {
      return transformNumber(value);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      const { default: defaultValue, ...rest } = value;
      const defaultResult = convertNumberToLength(defaultValue);
      const result: { default: string, [string]: ValueWithDefault<string> } = {
        default: typeof defaultResult === 'string' ? defaultResult : defaultStr,
      };
      for (const [key, value] of Object.entries(rest)) {
        result[key] = convertNumberToLength(value);
      }

      return result;
    }
    return value;
  };

const convertNumberToLength: (
  value: ValueWithDefault<number | string>,
) => ValueWithDefault<string> = convertNumberToStringUsing(
  (value) => (value === 0 ? '0' : `${value}px`),
  '0px',
);

const convertNumberToPercentage: (
  value: ValueWithDefault<number | string>,
) => ValueWithDefault<string> = convertNumberToStringUsing(
  (value) => (value === 0 ? '0' : `${value * 100}%`),
  '0',
);
