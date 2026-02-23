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
  StyleX$DefineConsts,
  StyleXArray,
  StyleXClassNameFor,
  StyleXStyles,
  StyleXStylesWithout,
  StyleXVar,
  Theme,
  VarGroup,
  PositionTry,
  ViewTransitionClass,
  StyleX$When,
  MapNamespace,
  StyleX$DefineMarker,
} from './types/StyleXTypes';
import type { ValueWithDefault } from './types/StyleXUtils';
import * as Types from './types/VarTypes';

export type {
  CompiledStyles,
  InlineStyles,
  Keyframes,
  MapNamespaces,
  StaticStyles,
  StaticStylesWithout,
  StyleXArray,
  StyleXClassNameFor,
  StyleXStyles,
  StyleXStylesWithout,
  StyleXVar,
  Theme,
  Types,
  VarGroup,
  PositionTry,
};

import { styleq } from 'styleq';

const errorForFn = (name: string) =>
  new Error(
    `Unexpected 'stylex.${name}' call at runtime. Styles must be compiled by '@stylexjs/babel-plugin'.`,
  );
const errorForType = (key: keyof typeof types) => errorForFn(`types.${key}`);

export const create: StyleX$Create = function stylexCreate<
  const S: { +[string]: unknown },
>(_styles: S): MapNamespaces<S> {
  throw errorForFn('create');
};

export const createTheme: StyleX$CreateTheme = (_baseTokens, _overrides) => {
  throw errorForFn('createTheme');
};

export const defineConsts: StyleX$DefineConsts = function stylexDefineConsts<
  const T: { +[string]: number | string },
>(_styles: T): T {
  throw errorForFn('defineConsts');
};

export const defineVars: StyleX$DefineVars = function stylexDefineVars(
  _styles: $FlowFixMe,
) {
  throw errorForFn('defineVars');
};

export const defineMarker: StyleX$DefineMarker = () => {
  throw errorForFn('defineMarker');
};

export const firstThatWorks = <T: string | number>(
  ..._styles: ReadonlyArray<T>
): ReadonlyArray<T> => {
  throw errorForFn('firstThatWorks');
};

export const keyframes = (_keyframes: Keyframes): string => {
  throw errorForFn('keyframes');
};

export const positionTry = (_positionTry: PositionTry): string => {
  throw errorForFn('positionTry');
};

export function props(
  this: ?unknown,
  ...styles: ReadonlyArray<
    StyleXArray<
      ?CompiledStyles | boolean | Readonly<[CompiledStyles, InlineStyles]>,
    >,
  >
): Readonly<{
  className?: string,
  'data-style-src'?: string,
  style?: Readonly<{ [string]: string | number }>,
}> {
  const [className, style, dataStyleSrc] = styleq(styles);
  const result: {
    className?: string,
    'data-style-src'?: string,
    style?: Readonly<{ [string]: string | number }>,
  } = {};
  if (className != null && className !== '') {
    result.className = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style;
  }
  if (dataStyleSrc != null && dataStyleSrc !== '') {
    result['data-style-src'] = dataStyleSrc;
  }
  return result;
}

export const viewTransitionClass = (
  _viewTransitionClass: ViewTransitionClass,
): string => {
  throw errorForFn('viewTransitionClass');
};

export const defaultMarker = (): MapNamespace<
  Readonly<{
    marker: 'default-marker',
  }>,
> => {
  throw errorForFn('defaultMarker');
};

export const when: StyleX$When = {
  ancestor: (_p) => {
    throw errorForFn('when.ancestor');
  },
  descendant: (_p) => {
    throw errorForFn('when.descendant');
  },
  siblingBefore: (_p) => {
    throw errorForFn('when.siblingBefore');
  },
  siblingAfter: (_p) => {
    throw errorForFn('when.siblingAfter');
  },
  anySibling: (_p) => {
    throw errorForFn('when.anySibling');
  },
};

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
  integer: <T: number = number>(_v: ValueWithDefault<T>): Types.Integer<T> => {
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
  number: <T: number = number>(_v: ValueWithDefault<T>): Types.Num<T> => {
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
  (...styles: ReadonlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
  create: StyleX$Create,
  createTheme: StyleX$CreateTheme,
  defineConsts: StyleX$DefineConsts,
  defineVars: StyleX$DefineVars,
  defaultMarker: () => MapNamespace<
    Readonly<{
      marker: 'default-marker',
    }>,
  >,
  defineMarker: StyleX$DefineMarker,
  firstThatWorks: <T: string | number>(
    ...v: ReadonlyArray<T>
  ) => ReadonlyArray<T>,
  keyframes: (keyframes: Keyframes) => string,
  positionTry: (positionTry: PositionTry) => string,
  props: (
    this: ?unknown,
    ...styles: ReadonlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | Readonly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => Readonly<{
    className?: string,
    'data-style-src'?: string,
    style?: Readonly<{ [string]: string | number }>,
  }>,
  viewTransitionClass: (viewTransitionClass: ViewTransitionClass) => string,
  types: typeof types,
  when: typeof when,
  __customProperties?: { [string]: unknown },
  ...
};

function _legacyMerge(
  ...styles: ReadonlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}

_legacyMerge.create = create;
_legacyMerge.createTheme = createTheme;
_legacyMerge.defineConsts = defineConsts;
_legacyMerge.defineMarker = defineMarker;
_legacyMerge.defineVars = defineVars;
_legacyMerge.defaultMarker = defaultMarker;
_legacyMerge.firstThatWorks = firstThatWorks;
_legacyMerge.keyframes = keyframes;
_legacyMerge.positionTry = positionTry;
_legacyMerge.props = props;
_legacyMerge.types = types;
_legacyMerge.when = when;
_legacyMerge.viewTransitionClass = viewTransitionClass;

export const legacyMerge: IStyleX = _legacyMerge;
