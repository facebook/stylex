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
  CompiledStyles,
  InlineStyles,
  Keyframes,
  MapNamespaces,
  StaticStyles,
  StaticStylesWithout,
  StyleX$Create,
  StyleX$CreateTheme,
  StyleX$DefineVars,
  StyleXArray,
  StyleXClassNameFor,
  StyleXStyles,
  StyleXStylesWithout,
  Theme,
  VarGroup,
} from './StyleXTypes';
import type { ValueWithDefault } from './util-types';
import * as Types from './VarTypes';

export type {
  StaticStyles,
  StaticStylesWithout,
  StyleXStyles,
  StyleXStylesWithout,
  Theme,
  Types,
  VarGroup,
};

import { styleq } from 'styleq';

const errorForFn = (name: string) =>
  new Error(
    `Unexpected 'stylex.${name}' call at runtime. Styles must be compiled by '@stylexjs/babel-plugin'.`,
  );
const errorForType = (key: $Keys<typeof types>) => errorForFn(`types.${key}`);

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

export const create: StyleX$Create = function stylexCreate<
  S: { +[string]: mixed },
>(_styles: S): MapNamespaces<S> {
  throw errorForFn('create');
};

export const createTheme: StyleX$CreateTheme = (_baseTokens, _overrides) => {
  throw errorForFn('createTheme');
};

export const defineVars: StyleX$DefineVars = function stylexDefineVars(
  _styles: $FlowFixMe,
) {
  throw errorForFn('defineVars');
};

export const firstThatWorks = <T: string | number>(
  ..._styles: $ReadOnlyArray<T>
): $ReadOnlyArray<T> => {
  throw errorForFn('firstThatWorks');
};

type StyleX$Include = <
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

export const include: StyleX$Include = (_styles) => {
  throw errorForFn('include');
};

export const keyframes = (_keyframes: Keyframes): string => {
  throw errorForFn('keyframes');
};

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

export const types = {
  angle: <T: string | 0 = string | 0>(
    _v: ValueWithDefault<T>,
  ): Types.Angle<T> => {
    throw errorForType('angle');
  },
  color: <T: string = string>(_v: ValueWithDefault<T>): Types.Color<T> => {
    throw errorForType('color');
  },
  url: <T: string = string>(_v: ValueWithDefault<T>): Types.Url<T> => {
    throw errorForType('url');
  },
  image: <T: string = string>(_v: ValueWithDefault<T>): Types.Image<T> => {
    throw errorForType('image');
  },
  integer: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Types.Integer<T> => {
    throw errorForType('integer');
  },
  lengthPercentage: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Types.LengthPercentage<T> => {
    throw errorForType('lengthPercentage');
  },
  length: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Types.Length<T> => {
    throw errorForType('length');
  },
  percentage: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Types.Percentage<T> => {
    throw errorForType('percentage');
  },
  number: <T: number | string = number | string>(
    _v: ValueWithDefault<T>,
  ): Types.Num<T> => {
    throw errorForType('number');
  },
  resolution: <T: string = string>(
    _v: ValueWithDefault<T>,
  ): Types.Resolution<T> => {
    throw errorForType('resolution');
  },
  time: <T: string | 0 = string | 0>(
    _v: ValueWithDefault<T>,
  ): Types.Time<T> => {
    throw errorForType('time');
  },
  transformFunction: <T: string = string>(
    _v: ValueWithDefault<T>,
  ): Types.TransformFunction<T> => {
    throw errorForType('transformFunction');
  },
  transformList: <T: string = string>(
    _v: ValueWithDefault<T>,
  ): Types.TransformList<T> => {
    throw errorForType('transformList');
  },
};

function _stylex(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_stylex.attrs = attrs;
_stylex.create = create;
_stylex.createTheme = createTheme;
_stylex.defineVars = defineVars;
_stylex.firstThatWorks = firstThatWorks;
_stylex.include = include;
_stylex.keyframes = keyframes;
_stylex.props = props;
_stylex.types = types;

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
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
  create: StyleX$Create,
  createTheme: StyleX$CreateTheme,
  defineVars: StyleX$DefineVars,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  include: StyleX$Include,
  keyframes: (keyframes: Keyframes) => string,
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
  types: typeof types,
  __customProperties?: { [string]: mixed },
  ...
};

export const legacyMerge: IStyleX = _stylex;
export default _stylex as IStyleX;
