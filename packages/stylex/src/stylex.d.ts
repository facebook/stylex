/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { $ReadOnly } from 'utility-types';

// Simulating an opaque type
declare const classNameSymbol: unique symbol;

export type ClassNameFor<K, V> = string & {
  _tag: typeof classNameSymbol;
  _key: K;
  _value: V;
};

export type ClassNameForKey<K> = ClassNameFor<K, string | number>;
export type ClassNameForValue<V> = ClassNameFor<string, V>;
export type ClassName = ClassNameFor<string, string | number>;

export type Namespace = {
  readonly [K in string]: string | number | { [K in string]: string | number };
};

export type CompiledNamespace = {
  readonly [K in string]:
    | ClassNameFor<K, string | number>
    | { [J in string]: ClassNameFor<`${K}+${J}`, string | number> };
};

export type NamespaceSet = {
  readonly [K in string]: Namespace;
};

export type CompiledNamespaceSet = {
  readonly [K in string]: CompiledNamespace;
};

type Stylex$Create = <S extends StyleXNamespaceSet>(
  styles: S
) => $ReadOnly<{
  readonly [K in keyof S]: {
    readonly [P in keyof S[K]]: S[K][P] extends string | number
      ? StyleXClassNameFor<P, S[K][P]>
      : {
          readonly [F in keyof S[K][P]]: StyleXClassNameFor<
            `${P}+${F}`,
            S[K][P][F]
          >;
        };
  };
}>;

type StylexInclude = <S extends CompiledNamespace>(
  compiledNamespace: S
) => {
  readonly [K in keyof S]: S[K] extends ClassNameFor<K, infer V>
    ? V
    : Uncompiled<S[K]>;
};

type Stylex$Keyframes = <S extends StyleXNamespaceSet>(
  animationConfig: S
) => string;

type stylex = {
  (
    ...styles: ReadonlyArray<
      StyleXArray<(CompiledNamespace | null | undefined) | boolean>
    >
  ): string;
  create: Stylex$Create;
  include: StylexInclude;
  inject: (
    ltrRule: string,
    priority: number,
    rtlRule: string | null | undefined
  ) => void;
  keyframes: Stylex$Keyframes;
};

export default stylex;
