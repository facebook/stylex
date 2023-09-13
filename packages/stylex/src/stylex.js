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
  StyleX$CreateVars,
  StyleX$OverrideVars,
  StyleXArray,
  Theme,
  FlattenTokens,
  MapNamespace,
  CompiledStyles,
} from './StyleXTypes';

import typeof * as TTypes from '@stylexjs/shared/lib/types';

export type { Theme, Variant } from './StyleXTypes';

import injectStyle from './stylex-inject';
import { styleq } from 'styleq';

type Cache = WeakMap<
  { +[string]: mixed },
  {
    classNameChunk: string,
    definedPropertiesChunk: Array<string>,
    next: Cache,
  },
>;

export function spread(
  styles: StyleXArray<
    | ?CompiledStyles
    | boolean
    | $ReadOnly<{ $$css?: void, [string]: string | number }>,
  >,
  _options?: { ... },
): $ReadOnly<{
  className: string,
  style: $ReadOnly<{ $$css?: void, [string]: string | number }>,
}> {
  const [className, style] = styleq(styles);
  return { className, style };
}

function stylexCreate(_styles: { ... }) {
  throw new Error(
    'stylex.create should never be called. It should be compiled away.',
  );
}

function stylexCreateVars<
  +DefaultTokens: {
    +[string]: string | { default: string, +[string]: string },
  },
  +ID: string = string,
>(_styles: DefaultTokens): Theme<FlattenTokens<DefaultTokens>, ID> {
  throw new Error(
    'stylex.createVars should never be called. It should be compiled away.',
  );
}

function stylexOverrideVars(_styles: { ... }) {
  throw new Error(
    'stylex.overrideVars should never be called. It should be compiled away.',
  );
}

function stylexIncludes<TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>,
): TStyles {
  throw new Error(
    'stylex.extends should never be called. It should be compiled away.',
  );
}

type Stylex$Include = <TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>,
) => TStyles;

export const create: Stylex$Create = stylexCreate;

export const unstable_createVars: StyleX$CreateVars = stylexCreateVars;

export const unstable_overrideVars: StyleX$OverrideVars = stylexOverrideVars;

export const include: Stylex$Include = stylexIncludes;

type TypeFunctionNames =
  | 'angle'
  | 'color'
  | 'url'
  | 'image'
  | 'integer'
  | 'lengthPercentage'
  | 'length'
  | 'percentage'
  | 'number'
  | 'resolution'
  | 'time'
  | 'transformFunction'
  | 'transformList';

const errorForType = (type: TypeFunctionNames) =>
  `stylex.types.${type} should be compiled away by @stylexjs/babel-plugin`;

export const types: Pick<TTypes, TypeFunctionNames> = {
  angle: (_v) => {
    throw new Error(errorForType('angle'));
  },
  color: (_v) => {
    throw new Error(errorForType('color'));
  },
  url: (_v) => {
    throw new Error(errorForType('url'));
  },
  image: (_v) => {
    throw new Error(errorForType('image'));
  },
  integer: (_v) => {
    throw new Error(errorForType('integer'));
  },
  lengthPercentage: (_v) => {
    throw new Error(errorForType('lengthPercentage'));
  },
  length: (_v) => {
    throw new Error(errorForType('length'));
  },
  percentage: (_v) => {
    throw new Error(errorForType('percentage'));
  },
  number: (_v) => {
    throw new Error(errorForType('number'));
  },
  resolution: (_v) => {
    throw new Error(errorForType('resolution'));
  },
  time: (_v) => {
    throw new Error(errorForType('time'));
  },
  transformFunction: (_v) => {
    throw new Error(errorForType('transformFunction'));
  },
  transformList: (_v) => {
    throw new Error(errorForType('transformList'));
  },
};

export const keyframes = (_keyframes: Keyframes): string => {
  throw new Error('stylex.keyframes should never be called');
};

export const firstThatWorks = <T: string | number>(
  ..._styles: $ReadOnlyArray<T>
): $ReadOnlyArray<T> => {
  throw new Error('stylex.firstThatWorks should never be called.');
};

export const inject: typeof injectStyle = injectStyle;

export const UNSUPPORTED_PROPERTY = <T>(_props: T): T => {
  throw new Error(
    'stylex.UNSUPPORTED_PROPERTY should never be called. It should be compiled away.',
  );
};

function _stylex(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_stylex.spread = spread;
_stylex.create = create;
_stylex.unstable_createVars = unstable_createVars;
_stylex.unstable_overrideVars = unstable_overrideVars;
_stylex.include = include;
_stylex.keyframes = keyframes;
_stylex.firstThatWorks = firstThatWorks;
_stylex.inject = inject;
_stylex.UNSUPPORTED_PROPERTY = UNSUPPORTED_PROPERTY;
_stylex.types = types;

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
  spread: (
    styles: StyleXArray<
      | ?CompiledStyles
      | boolean
      | $ReadOnly<{ $$css?: void, [string]: string | number }>,
    >,
    _options?: { ... },
  ) => $ReadOnly<{
    className: string,
    style: $ReadOnly<{ $$css?: void, [string]: string | number }>,
  }>,
  create: Stylex$Create,
  unstable_createVars: StyleX$CreateVars,
  unstable_overrideVars: StyleX$OverrideVars,
  include: Stylex$Include,
  types: Pick<TTypes, TypeFunctionNames>,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  inject: (ltrRule: string, priority: number, rtlRule: ?string) => void,
  keyframes: (keyframes: Keyframes) => string,
  UNSUPPORTED_PROPERTY: <T>(props: T) => T,
  ...
};

export default (_stylex: IStyleX);

export const stylex: IStyleX = _stylex;
