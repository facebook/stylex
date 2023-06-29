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
  StyleXArray,
  MapNamespace,
} from './StyleXTypes';

import injectStyle from './stylex-inject';
import { styleq } from 'styleq';

type Cache = WeakMap<
  { ... },
  {
    classNameChunk: string,
    definedPropertiesChunk: Array<string>,
    next: Cache,
  }
>;

type DedupeStyles = $ReadOnly<{
  [key: string]: string | $ReadOnly<{ [key: string]: string, ... }>,
  ...
}>;

export function spread(
  styles: StyleXArray<?DedupeStyles | boolean | { [string]: string | number }>,
  _options?: { ... }
): { className: string, style: { [string]: string | number } } {
  const [className, style] = styleq(styles);
  return { className, style };
}

function stylexCreate(_styles: { ... }) {
  throw new Error(
    'stylex.create should never be called. It should be compiled away.'
  );
}

function stylexIncludes<TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>
): TStyles {
  throw new Error(
    'stylex.extends should never be called. It should be compiled away.'
  );
}

type Stylex$Include = <TStyles: { +[string]: string | number }>(
  _styles: MapNamespace<TStyles>
) => TStyles;

export const create: Stylex$Create = stylexCreate;

export const include: Stylex$Include = stylexIncludes;

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
    'stylex.UNSUPPORTED_PROPERTY should never be called. It should be compiled away.'
  );
};

function _stylex(
  ...styles: Array<StyleXArray<?DedupeStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_stylex.spread = spread;
_stylex.create = create;
_stylex.include = include;
_stylex.keyframes = keyframes;
_stylex.firstThatWorks = firstThatWorks;
_stylex.inject = inject;
_stylex.UNSUPPORTED_PROPERTY = UNSUPPORTED_PROPERTY;

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?DedupeStyles | boolean>>): string,
  spread: (
    styles: $ReadOnlyArray<StyleXArray<?DedupeStyles | boolean>>,
    options?: { ... }
  ) => {
    className: string,
    style: { [string]: string | number },
  },
  create: Stylex$Create,
  include: Stylex$Include,
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
