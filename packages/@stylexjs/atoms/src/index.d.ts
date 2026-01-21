/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StyleXStyles } from '@stylexjs/stylex';
import type { Properties } from 'csstype';

/**
 * Static atom access returns CompiledStyles compatible with stylex.props
 * e.g., css.display.flex -> { $$css: true, display: 'x78zum5' }
 */
type StaticAtom<V> = StyleXStyles<{ [key: string]: V }>;

/**
 * Dynamic atom call returns StyleXStyles with inline styles
 * e.g., css.color(myVar) -> [{ $$css: true, color: 'x14rh7hd' }, { '--x-color': myVar }]
 */
type DynamicAtom<V> = (value: V) => StyleXStyles<{ [key: string]: V }>;

/**
 * Each CSS property provides both static access and dynamic function call
 */
type AtomProperty<V> = {
  [Key in string | number]: StaticAtom<V>;
} & DynamicAtom<V>;

type CSSValue = string | number;

/**
 * The atoms namespace provides access to all CSS properties.
 * All properties are defined (non-optional) to avoid undefined checks.
 */
type Atoms = {
  [Key in keyof Properties<CSSValue>]-?: AtomProperty<
    NonNullable<Properties<CSSValue>[Key]>
  >;
};

declare const atoms: Atoms;

export = atoms;
