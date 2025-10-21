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
const errorForType = (key: $Keys<typeof types>) => errorForFn(`types.${key}`);

export const create: StyleX$Create = function stylexCreate<
  S: { +[string]: mixed },
>(_styles: S): MapNamespaces<S> {
  throw errorForFn('create');
};

export const createTheme: StyleX$CreateTheme = (_baseTokens, _overrides) => {
  throw errorForFn('createTheme');
};

export const defineConsts: StyleX$DefineConsts = function stylexDefineConsts<
  T: { +[string]: number | string },
>(_styles: T): T {
  throw errorForFn('defineConsts');
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

export const positionTry = (_positionTry: PositionTry): string => {
  throw errorForFn('positionTry');
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
  'data-style-src'?: string,
  style?: $ReadOnly<{ [string]: string | number }>,
}> {
  const [className, style, dataStyleSrc] = styleq(styles);
  const result: {
    className?: string,
    'data-style-src'?: string,
    style?: $ReadOnly<{ [string]: string | number }>,
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

export const defaultMarker = (): $ReadOnly<{
  marker: 'default-marker',
  $$css: true,
}> => {
  throw errorForFn('defaultMarker');
};

type PseudoToSuffix = {
  ':hover': StringSuffix<':hover'>,
  ':focus': StringSuffix<':focus'>,
  ':active': StringSuffix<':active'>,
  ':visited': StringSuffix<':visited'>,
  ':focus-visible': StringSuffix<':focus-visible'>,
  ':focus-within': StringSuffix<':focus-within'>,
  ':target': StringSuffix<':target'>,
  ':target-within': StringSuffix<':target-within'>,
  ':first-child': StringSuffix<':first-child'>,
  ':last-child': StringSuffix<':last-child'>,
  ':only-child': StringSuffix<':only-child'>,
  ':empty': StringSuffix<':empty'>,
  ':link': StringSuffix<':link'>,
  ':any-link': StringSuffix<':any-link'>,
  ':enabled': StringSuffix<':enabled'>,
  ':disabled': StringSuffix<':disabled'>,
  ':required': StringSuffix<':required'>,
  ':optional': StringSuffix<':optional'>,
  ':read-only': StringSuffix<':read-only'>,
  ':read-write': StringSuffix<':read-write'>,
  ':placeholder-shown': StringSuffix<':placeholder-shown'>,
  ':in-range': StringSuffix<':in-range'>,
  ':out-of-range': StringSuffix<':out-of-range'>,
  ':default': StringSuffix<':default'>,
  ':checked': StringSuffix<':checked'>,
  ':indeterminate': StringSuffix<':indeterminate'>,
  ':blank': StringSuffix<':blank'>,
  ':valid': StringSuffix<':valid'>,
  ':invalid': StringSuffix<':invalid'>,
  ':user-invalid': StringSuffix<':user-invalid'>,
  ':autofill': StringSuffix<':autofill'>,
  ':picture-in-picture': StringSuffix<':picture-in-picture'>,
  ':modal': StringSuffix<':modal'>,
  ':fullscreen': StringSuffix<':fullscreen'>,
  ':paused': StringSuffix<':paused'>,
  ':playing': StringSuffix<':playing'>,
  ':current': StringSuffix<':current'>,
  ':past': StringSuffix<':past'>,
  ':future': StringSuffix<':future'>,
};

export const when = {
  ancestor: <P: $Keys<PseudoToSuffix>>(
    _pseudo?: P,
  ): StringPrefix<':where-ancestor'> & PseudoToSuffix[P] => {
    throw errorForFn('when.ancestor');
  },
  descendant: <P: $Keys<PseudoToSuffix>>(
    _pseudo?: P,
  ): StringPrefix<':where-descendant'> & PseudoToSuffix[P] => {
    throw errorForFn('when.descendant');
  },
  siblingBefore: <P: $Keys<PseudoToSuffix>>(
    _pseudo?: P,
  ): StringPrefix<':where-sibling-before'> & PseudoToSuffix[P] => {
    throw errorForFn('when.siblingBefore');
  },
  siblingAfter: <P: $Keys<PseudoToSuffix>>(
    _pseudo?: P,
  ): StringPrefix<':where-sibling-after'> & PseudoToSuffix[P] => {
    throw errorForFn('when.siblingAfter');
  },
  anySibling: <P: $Keys<PseudoToSuffix>>(
    _pseudo?: P,
  ): StringPrefix<':where-any-sibling'> & PseudoToSuffix[P] => {
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
  (...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
  create: StyleX$Create,
  createTheme: StyleX$CreateTheme,
  defineConsts: StyleX$DefineConsts,
  defineVars: StyleX$DefineVars,
  defaultMarker: () => $ReadOnly<{
    marker: 'default-marker',
    $$css: true,
  }>,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  keyframes: (keyframes: Keyframes) => string,
  positionTry: (positionTry: PositionTry) => string,
  props: (
    this: ?mixed,
    ...styles: $ReadOnlyArray<
      StyleXArray<
        ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
      >,
    >
  ) => $ReadOnly<{
    className?: string,
    'data-style-src'?: string,
    style?: $ReadOnly<{ [string]: string | number }>,
  }>,
  viewTransitionClass: (viewTransitionClass: ViewTransitionClass) => string,
  types: typeof types,
  when: typeof when,
  __customProperties?: { [string]: mixed },
  ...
};

function _legacyMerge(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}

_legacyMerge.create = create;
_legacyMerge.createTheme = createTheme;
_legacyMerge.defineConsts = defineConsts;
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
