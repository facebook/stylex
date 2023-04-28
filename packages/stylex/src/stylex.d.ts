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

type Stylex$Create = <S extends NamespaceSet>(
  styles: S
) => $ReadOnly<{
  readonly [K in keyof S]: {
    readonly [P in keyof S[K]]: S[K][P] extends string | number
      ? ClassNameFor<P, S[K][P]>
      : {
          readonly [F in keyof S[K][P]]: ClassNameFor<`${P}+${F}`, S[K][P][F]>;
        };
  };
}>;

type StylexInclude = <S extends CompiledNamespace>(
  compiledNamespace: S
) => {
  readonly [K in keyof S]: S[K] extends ClassNameFor<K, infer V> ? V : S[K];
};

type Stylex$Keyframes = <S extends NamespaceSet>(animationConfig: S) => string;

type NestedArray<T> = T | Array<T | NestedArray<T>>;

declare let stylex: {
  (
    ...styles: ReadonlyArray<
      NestedArray<(CompiledNamespace | null | undefined) | boolean>
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
  spread: (
    ...styles: ReadonlyArray<
      NestedArray<(Object | CompiledNamespace | null | undefined) | boolean>
    >
  ) => {
    className: string;
    style: { [key: string]: string | number };
  };
};

export default stylex;
