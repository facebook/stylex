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
  FlatCompiledStyles as _FlatCompiledStyles,
} from './common-types';

export type {
  RawStyles,
  StyleRule,
  TNestableStyleValue,
  TRawValue,
  TStyleValue,
  FlatCompiledStyles,
} from './common-types';

// All functions exposed from `stylex` are defined in a way that can be run
// entirely in the browser.

// These are the implementations of those functions.

import styleXCreateSet from './stylex-create';
import styleXDefineVars from './stylex-define-vars';
import styleXDefineConsts from './stylex-define-consts';
import styleXCreateTheme from './stylex-create-theme';
import stylexKeyframes from './stylex-keyframes';
import _stylexPositionTry from './stylex-position-try';
import stylexFirstThatWorks from './stylex-first-that-works';
import _stylexDefaultMarker from './stylex-defaultMarker';
import _stylexViewTransitionClass from './stylex-view-transition-class';
import hash from './hash';
import genFileBasedIdentifier from './utils/file-based-identifier';
import { convertStyleToClassName as _convertStyleToClassName } from './utils/convert-to-className';
import { defaultOptions as _defaultOptions } from './utils/default-options';
import * as _transformValue from './utils/transform-value';
import {
  timeUnits as _timeUnits,
  lengthUnits as _lengthUnits,
  getNumberSuffix as _getNumberSuffix,
} from './utils/transform-value';
import * as m from './messages';
import _flatMapExpandedShorthands from './preprocess-rules';
import {
  LOGICAL_FLOAT_START_VAR as _LOGICAL_FLOAT_START_VAR,
  LOGICAL_FLOAT_END_VAR as _LOGICAL_FLOAT_END_VAR,
} from './preprocess-rules/legacy-expand-shorthands';
import {
  default as _getPriority,
  getAtRulePriority as _getAtRulePriority,
  getPseudoElementPriority as _getPseudoElementPriority,
  getPseudoClassPriority as _getPseudoClassPriority,
  getDefaultPriority as _getDefaultPriority,
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
export const positionTry: typeof _stylexPositionTry = _stylexPositionTry;
export const stylexPositionTry: typeof _stylexPositionTry = _stylexPositionTry;
export const stylexDefaultMarker: typeof _stylexDefaultMarker = _stylexDefaultMarker;
export const stylexViewTransitionClass: typeof _stylexViewTransitionClass = _stylexViewTransitionClass;
export const utils: {
  hash: typeof hash,
  genFileBasedIdentifier: typeof genFileBasedIdentifier,
} = {
  hash,
  genFileBasedIdentifier,
};
export const messages: typeof m = m;
export const firstThatWorks: typeof stylexFirstThatWorks = stylexFirstThatWorks;
export const flatMapExpandedShorthands: typeof _flatMapExpandedShorthands = _flatMapExpandedShorthands;
export const LOGICAL_FLOAT_START_VAR: typeof _LOGICAL_FLOAT_START_VAR = _LOGICAL_FLOAT_START_VAR;
export const LOGICAL_FLOAT_END_VAR: typeof _LOGICAL_FLOAT_END_VAR = _LOGICAL_FLOAT_END_VAR;
export const PSEUDO_CLASS_PRIORITIES: typeof _PSEUDO_CLASS_PRIORITIES =
  _PSEUDO_CLASS_PRIORITIES;
export const AT_RULE_PRIORITIES: typeof _AT_RULE_PRIORITIES =
  _AT_RULE_PRIORITIES;
export const PSEUDO_ELEMENT_PRIORITY: typeof _PSEUDO_ELEMENT_PRIORITY =
  _PSEUDO_ELEMENT_PRIORITY;
export const getAtRulePriority: typeof _getAtRulePriority = _getAtRulePriority;
export const getPseudoElementPriority: typeof _getPseudoElementPriority =
  _getPseudoElementPriority;
export const getPseudoClassPriority: typeof _getPseudoClassPriority =
  _getPseudoClassPriority;
export const getDefaultPriority: typeof _getDefaultPriority =
  _getDefaultPriority;
export const getPriority: typeof _getPriority = _getPriority;
export const convertStyleToClassName: typeof _convertStyleToClassName =
  _convertStyleToClassName;
export const defaultOptions: typeof _defaultOptions = _defaultOptions;
export const transformValue: typeof _transformValue = _transformValue;
export const timeUnits: typeof _timeUnits = _timeUnits;
export const lengthUnits: typeof _lengthUnits = _lengthUnits;
export const getNumberSuffix: typeof _getNumberSuffix = _getNumberSuffix;

export type InjectableStyle = _InjectableStyle;
export type CompiledNamespaces = _CompiledNamespaces;
export type MutableCompiledNamespaces = _MutableCompiledNamespaces;
export type StyleXOptions = _StyleXOptions;
