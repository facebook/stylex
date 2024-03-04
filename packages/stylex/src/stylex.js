/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import type {
  Keyframes,
  Stylex$Create,
  StyleX$DefineVars,
  StyleX$CreateTheme,
  StyleXArray,
  CompiledStyles,
  InlineStyles,
  StyleXClassNameFor,
  MapNamespaces,
} from './StyleXTypes';
import type {
  ValueWithDefault,
  Angle,
  Color,
  Url,
  Image,
  Integer,
  LengthPercentage,
  Length,
  Percentage,
  Num,
  Resolution,
  Time,
  TransformFunction,
  TransformList,
} from './VarTypes';

export type {
  VarGroup,
  Theme,
  StyleXStyles,
  StyleXStylesWithout,
  StaticStyles,
  StaticStylesWithout,
} from './StyleXTypes';

import { styleq } from 'styleq';

type Cache = WeakMap<
  { +[string]: mixed },
  {
    classNameChunk: string,
    definedPropertiesChunk: Array<string>,
    next: Cache,
  },
>;

const errorForFn = (name: string) =>
  new Error(
    `'stylex.${name}' should never be called at runtime. It should be compiled away by '@stylexjs/babel-plugin'`,
  );
const errorForType = (key: $Keys<typeof types>) => errorForFn(`types.${key}`);

export function props(
  this: ?mixed,
  ...styles: $ReadOnlyArray<
    StyleXArray<
      ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
    >,
  >
): $ReadOnly<{
  className?: string,
  style?: $ReadOnly<{ [string]: string | number }>,
}> {
  const options = this;
  if (__implementations.props) {
    return __implementations.props.call(options, styles);
  }
  const [className, style] = styleq(styles);
  const result: {
    className?: string,
    style?: $ReadOnly<{ [string]: string | number }>,
  } = {};
  if (className != null && className !== '') {
    result.className = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style;
  }
  return result;
}
export function attrs(
  ...styles: $ReadOnlyArray<
    StyleXArray<
      ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
    >,
  >
): $ReadOnly<{
  class?: string,
  style?: string,
}> {
  const { className, style } = props(...styles);
  const result: {
    class?: string,
    style?: string,
  } = {};
  if (className != null && className !== '') {
    result.class = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = Object.keys(style)
      .map((key) => `${key}:${style[key]};`)
      .join('');
  }
  return result;
}

function stylexCreate<S: { +[string]: mixed }>(styles: S): MapNamespaces<S> {
  if (__implementations.create != null) {
    const create: Stylex$Create = __implementations.create;
    return create<S>(styles);
  }
  throw errorForFn('create');
}

function stylexDefineVars(styles: any) {
  if (__implementations.defineVars) {
    return __implementations.defineVars(styles);
  }
  throw errorForFn('defineVars');
}

const stylexCreateTheme: StyleX$CreateTheme = (baseTokens, overrides) => {
  if (__implementations.createTheme) {
    // $FlowFixMe
    return __implementations.createTheme(baseTokens, overrides);
  }
  throw errorForFn('createTheme');
};

type Stylex$Include = <
  TStyles: { +[string]: StyleXClassNameFor<string, mixed> },
>(
  styles: TStyles,
) => {
  +[Key in keyof TStyles]: TStyles[Key] extends StyleXClassNameFor<
    mixed,
    infer V,
  >
    ? V
    : string,
};

const stylexInclude: Stylex$Include = (styles) => {
  if (__implementations.include) {
    return __implementations.include(styles);
  }
  throw errorForFn('include');
};

export const create: Stylex$Create = stylexCreate;

export const defineVars: StyleX$DefineVars = stylexDefineVars;

export const createTheme: StyleX$CreateTheme = stylexCreateTheme;

export const include: Stylex$Include = stylexInclude;

function color<T: string = string>(_v: ValueWithDefault<T>): Color<T> {
  throw errorForType('color');
}

export const types = {
  angle: <T: string | 0 = string | 0>(_v: ValueWithDefault<T>): Angle<T> => {
    throw errorForType('angle');
  },
  color,
  url: <T: string = string>(_v: ValueWithDefault<T>): Url<T> => {
    throw errorForType('url');
  },
  image: <T: string = string>(_v: ValueWithDefault<T>): Image<T> => {
    throw errorForType('image');
  },
  integer: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Integer<T> => {
    throw errorForType('integer');
  },
  lengthPercentage: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): LengthPercentage<T> => {
    throw errorForType('lengthPercentage');
  },
  length: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Length<T> => {
    throw errorForType('length');
  },
  percentage: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Percentage<T> => {
    throw errorForType('percentage');
  },
  number: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Num<T> => {
    throw errorForType('number');
  },
  resolution: <T: string = string>(_v: ValueWithDefault<T>): Resolution<T> => {
    throw errorForType('resolution');
  },
  time: <T: string | 0 = string | 0>(_v: ValueWithDefault<T>): Time<T> => {
    throw errorForType('time');
  },
  transformFunction: <T: string = string>(
    _v: ValueWithDefault<T>,
  ): TransformFunction<T> => {
    throw errorForType('transformFunction');
  },
  transformList: <T: string = string>(
    _v: ValueWithDefault<T>,
  ): TransformList<T> => {
    throw errorForType('transformList');
  },
};

export const keyframes = (keyframes: Keyframes): string => {
  if (__implementations.keyframes) {
    return __implementations.keyframes(keyframes);
  }
  throw errorForFn('keyframes');
};

export const firstThatWorks = <T: string | number>(
  ...styles: $ReadOnlyArray<T>
): $ReadOnlyArray<T> => {
  if (__implementations.firstThatWorks) {
    return __implementations.firstThatWorks(...styles);
  }
  throw errorForFn('firstThatWorks');
};

function _stylex(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_stylex.props = props;
_stylex.attrs = attrs;
_stylex.create = create;
_stylex.defineVars = defineVars;
_stylex.createTheme = createTheme;
_stylex.include = include;
_stylex.keyframes = keyframes;
_stylex.firstThatWorks = firstThatWorks;
_stylex.types = types;

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
  props: (
    this: ?mixed,
    ...styles: $ReadOnlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => $ReadOnly<{
    className?: string,
    style?: $ReadOnly<{ [string]: string | number }>,
  }>,
  attrs: (
    ...styles: $ReadOnlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => $ReadOnly<{
    class?: string,
    style?: string,
  }>,
  create: Stylex$Create,
  defineVars: StyleX$DefineVars,
  createTheme: StyleX$CreateTheme,
  include: Stylex$Include,
  types: typeof types,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  keyframes: (keyframes: Keyframes) => string,
  __customProperties?: { [string]: mixed },
  ...
};

const __implementations: { [string]: $FlowFixMe } = {};

export function __monkey_patch__(
  key: string,
  implementation: $FlowFixMe,
): void {
  if (key === 'types') {
    Object.assign(types, implementation);
  } else {
    __implementations[key] = implementation;
  }
}

export const legacyMerge: IStyleX = _stylex;
export default _stylex as IStyleX;
