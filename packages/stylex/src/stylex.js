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

/**
 * DO NOT USE. Legacy export for Meta
 */

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

function _legacyMerge(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_legacyMerge.attrs = attrs;
_legacyMerge.create = create;
_legacyMerge.createTheme = createTheme;
_legacyMerge.defineVars = defineVars;
_legacyMerge.firstThatWorks = firstThatWorks;
_legacyMerge.keyframes = keyframes;
_legacyMerge.props = props;
_legacyMerge.types = types;

export const legacyMerge: IStyleX = _legacyMerge;
