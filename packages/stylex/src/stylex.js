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
  FlattenTokens,
  CompiledStyles,
  InlineStyles,
  StyleXClassNameFor,
  MapNamespaces,
  VarGroup,
  StyleXVar,
} from './StyleXTypes';

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

function stylexCreate<S: { +[string]: mixed }>(styles: S): MapNamespaces<S> {
  if (__implementations.create != null) {
    const create: Stylex$Create = __implementations.create;
    return create<S>(styles);
  }
  throw new Error(
    'stylex.create should never be called. It should be compiled away.',
  );
}

function stylexDefineVars<
  DefaultTokens: {
    +[string]:
      | number
      | string
      | { +default: number | string, +[string]: number | string }
      | StyleXVar<number | string>,
  },
  ID: string = string,
>(styles: DefaultTokens): VarGroup<FlattenTokens<DefaultTokens>, ID> {
  if (__implementations.defineVars) {
    return __implementations.defineVars(styles);
  }
  throw new Error(
    'stylex.defineVars should never be called. It should be compiled away.',
  );
}

const stylexCreateTheme: StyleX$CreateTheme = (baseTokens, overrides) => {
  if (__implementations.createTheme) {
    // $FlowFixMe
    return __implementations.createTheme(baseTokens, overrides);
  }
  throw new Error(
    'stylex.createTheme should never be called. It should be compiled away.',
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

export const defineVars: StyleX$DefineVars = stylexDefineVars;

export const createTheme: StyleX$CreateTheme = stylexCreateTheme;

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

function _stylex(
  ...styles: $ReadOnlyArray<StyleXArray<?CompiledStyles | boolean>>
): string {
  const [className] = styleq(styles);
  return className;
}
_stylex.props = props;
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
export default (_stylex: IStyleX);
