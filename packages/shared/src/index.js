/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type {
  RawStyles,
  StyleRule,
  TNestableStyleValue,
  TRawValue,
  TStyleValue,
} from './common-types';

// All functions exposed from `stylex` are defined in a way that can be run
// entirely in the browser.

// These are the implementations of those functions.

import styleXCreateSet from './stylex-create';
import stylexKeyframes from './stylex-keyframes';
import stylexInclude, {
  IncludedStyles as _IncludedStyles,
} from './stylex-include';
import stylexFirstThatWorks from './stylex-first-that-works';
import * as m from './messages';

export const create = styleXCreateSet;
export const keyframes = stylexKeyframes;
export const include = stylexInclude;
export const messages = m;
export const IncludedStyles = _IncludedStyles;
export const firstThatWorks = stylexFirstThatWorks;
