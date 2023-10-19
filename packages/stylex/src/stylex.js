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
  CompiledStyles,
  InlineStyles,
  StyleXClassNameFor,
  MapNamespaces,
} from './StyleXTypes';

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
    ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
  >,
  _options?: { ... },
): $ReadOnly<{
  className: string,
  style: $ReadOnly<{ [string]: string | number }>,
}> {
  if (__implementations.spread) {
    return __implementations.spread(styles, _options);
  }
  const [className, style] = styleq(styles);
  return { className, style };
}

function stylexCreate<S: { +[string]: mixed }>(styles: S): MapNamespaces<S> {
  if (__implementations.create != null) {
    const create: Stylex$Create = __implementations.create;
    return create<S>(styles);
  }
  throw new Error(
    'stylex.create should never be called. It should be compiled away.',
  );
}

function stylexCreateVars<
  DefaultTokens: {
    +[string]: string | { +default: string, +[string]: string },
  },
  ID: string = string,
>(styles: DefaultTokens): Theme<FlattenTokens<DefaultTokens>, ID> {
  if (__implementations.unstable_createVars) {
    return __implementations.unstable_createVars(styles);
  }
  throw new Error(
    'stylex.createVars should never be called. It should be compiled away.',
  );
}

const stylexOverrideVars: StyleX$OverrideVars = (baseTokens, overrides) => {
  if (__implementations.unstable_overrideVars) {
    // $FlowFixMe
    return __implementations.unstable_overrideVars(baseTokens, overrides);
  }
  throw new Error(
    'stylex.overrideVars should never be called. It should be compiled away.',
  );
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
  throw new Error(
    'stylex.extends should never be called. It should be compiled away.',
  );
};

export const create: Stylex$Create = stylexCreate;

export const unstable_createVars: StyleX$CreateVars = stylexCreateVars;

export const unstable_overrideVars: StyleX$OverrideVars = stylexOverrideVars;

export const include: Stylex$Include = stylexInclude;

type ValueWithDefault<+T> =
  | T
  | $ReadOnly<{
      +default: T,
      +[string]: ValueWithDefault<T>,
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

interface ICSSType<+T: string | number> {
  +value: ValueWithDefault<T>;
  +syntax: CSSSyntaxType;
}

export const types = {
  angle: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('angle'));
  },
  color: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('color'));
  },
  url: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('url'));
  },
  image: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('image'));
  },
  integer: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('integer'));
  },
  lengthPercentage: <T: number | string>(
    _v: ValueWithDefault<T>,
  ): ICSSType<T> => {
    throw new Error(errorForType('lengthPercentage'));
  },
  length: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('length'));
  },
  percentage: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('percentage'));
  },
  number: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('number'));
  },
  resolution: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('resolution'));
  },
  time: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('time'));
  },
  transformFunction: <T: number | string>(
    _v: ValueWithDefault<T>,
  ): ICSSType<T> => {
    throw new Error(errorForType('transformFunction'));
  },
  transformList: <T: number | string>(_v: ValueWithDefault<T>): ICSSType<T> => {
    throw new Error(errorForType('transformList'));
  },
};
const errorForType = (type: $Keys<typeof types>) =>
  `stylex.types.${type} should be compiled away by @stylexjs/babel-plugin`;

export const keyframes = (keyframes: Keyframes): string => {
  if (__implementations.keyframes) {
    return __implementations.keyframes(keyframes);
  }
  throw new Error('stylex.keyframes should never be called');
};

export const firstThatWorks = <T: string | number>(
  ...styles: $ReadOnlyArray<T>
): $ReadOnlyArray<T> => {
  if (__implementations.firstThatWorks) {
    return __implementations.firstThatWorks(...styles);
  }
  throw new Error('stylex.firstThatWorks should never be called.');
};

export const inject: typeof injectStyle = injectStyle;

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
_stylex.types = types;

type IStyleX = {
  (...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>): string,
  spread: (
    styles: StyleXArray<
      ?CompiledStyles | boolean | $ReadOnly<[CompiledStyles, InlineStyles]>,
    >,
    _options?: { ... },
  ) => $ReadOnly<{
    className: string,
    style: $ReadOnly<{ [string]: string | number }>,
  }>,
  create: Stylex$Create,
  unstable_createVars: StyleX$CreateVars,
  unstable_overrideVars: StyleX$OverrideVars,
  include: Stylex$Include,
  types: typeof types,
  firstThatWorks: <T: string | number>(
    ...v: $ReadOnlyArray<T>
  ) => $ReadOnlyArray<T>,
  inject: (ltrRule: string, priority: number, rtlRule: ?string) => void,
  keyframes: (keyframes: Keyframes) => string,
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

export const stylex: IStyleX = _stylex;
export default (_stylex: IStyleX);
