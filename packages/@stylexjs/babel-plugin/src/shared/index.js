/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {
  InjectableStyle as _InjectableStyle,
  CompiledNamespaces as _CompiledNamespaces,
  MutableCompiledNamespaces as _MutableCompiledNamespaces,
  StyleXOptions as _StyleXOptions,
} from './common-types';

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
import styleXDefineVars from './stylex-define-vars';
import styleXDefineConsts from './stylex-define-consts';
import styleXCreateTheme from './stylex-create-theme';
import stylexKeyframes from './stylex-keyframes';
import stylexPositionTry from './stylex-position-try';
import stylexFirstThatWorks from './stylex-first-that-works';
import hash from './hash';
import genFileBasedIdentifier from './utils/file-based-identifier';
import * as m from './messages';
import {
  PSEUDO_CLASS_PRIORITIES as _PSEUDO_CLASS_PRIORITIES,
  AT_RULE_PRIORITIES as _AT_RULE_PRIORITIES,
  PSEUDO_ELEMENT_PRIORITY as _PSEUDO_ELEMENT_PRIORITY,
} from './utils/property-priorities';

export * as types from './types';
export * as when from './when/when';

export const create: typeof styleXCreateSet = styleXCreateSet;
export const defineVars: typeof styleXDefineVars = styleXDefineVars;
export const defineConsts: typeof styleXDefineConsts = styleXDefineConsts;
export const createTheme: typeof styleXCreateTheme = styleXCreateTheme;
export const keyframes: typeof stylexKeyframes = stylexKeyframes;
export const positionTry: typeof stylexPositionTry = stylexPositionTry;
export const utils: {
  hash: typeof hash,
  genFileBasedIdentifier: typeof genFileBasedIdentifier,
} = {
  hash,
  genFileBasedIdentifier,
};
export const messages: typeof m = m;
export const firstThatWorks: typeof stylexFirstThatWorks = stylexFirstThatWorks;
export const PSEUDO_CLASS_PRIORITIES: typeof _PSEUDO_CLASS_PRIORITIES =
  _PSEUDO_CLASS_PRIORITIES;
export const AT_RULE_PRIORITIES: typeof _AT_RULE_PRIORITIES =
  _AT_RULE_PRIORITIES;
export const PSEUDO_ELEMENT_PRIORITY: typeof _PSEUDO_ELEMENT_PRIORITY =
  _PSEUDO_ELEMENT_PRIORITY;

export type InjectableStyle = _InjectableStyle;
export type CompiledNamespaces = _CompiledNamespaces;
export type MutableCompiledNamespaces = _MutableCompiledNamespaces;
export type StyleXOptions = _StyleXOptions;
