/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

// This file contains constants to be used within Error messages.
// The URLs within will eventually be replaced by links to the documentation website for Stylex.

export const ILLEGAL_ARGUMENT_LENGTH =
  'stylex.create() should have 1 argument.';
export const ILLEGAL_ARG_LENGTH_FOR_KEYFRAMES =
  'stylex.keyframes() should have 1 argument.';
export const NON_STATIC_VALUE =
  'Only static values are allowed inside of a stylex.create() call.';
export const NON_STATIC_KEYFRAME_VALUE =
  'Only static values are allowed inside of a stylex.keyframes() call.';
export const ESCAPED_STYLEX_VALUE =
  'Escaping a stylex.create() value is not allowed.';
export const UNBOUND_STYLEX_CALL_VALUE =
  'stylex.create calls must be bound to a bare variable.';
export const ONLY_TOP_LEVEL =
  'stylex.create() is only allowed at the root of a program.';
export const NON_OBJECT_FOR_STYLEX_CALL =
  'stylex.create() can only accept a style object.';
export const NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL =
  'stylex.keyframes() can only accept an object.';
export const UNKNOWN_PROP_KEY = 'Unknown property key';
export const INVALID_PSEUDO = 'Invalid pseudo selector, not on the whitelist.';
export const INVALID_PSEUDO_OR_AT_RULE = 'Invalid pseudo or at-rule.';
export const NO_CONDITIONAL_SHORTHAND =
  'You cannot use conditional style values for a shorthand property.';
export const ILLEGAL_NAMESPACE_TYPE =
  'Only a string literal namespace is allowed here.';
export const UNKNOWN_NAMESPACE = 'Unknown namespace';
export const ILLEGAL_NESTED_PSEUDO =
  "Pseudo objects can't be nested more than one level deep.";
export const ILLEGAL_PROP_VALUE =
  'A style value can only contain an array, string or number.';
export const ILLEGAL_PROP_ARRAY_VALUE =
  'A style array value can only contain strings or numbers.';
export const ILLEGAL_NAMESPACE_VALUE = 'A stylex namespace must be an object.';
export const NON_OBJECT_KEYFRAME =
  'Every frame within a stylex.keyframes() call must be an object.';
export const INVALID_SPREAD =
  'Imported styles spread with a stylex.create call must be type cast as `XStyle<>` to verify their type.';
export const LINT_UNCLOSED_FUNCTION = 'Rule contains an unclosed function';
export const LOCAL_ONLY =
  'The return value of stylex.create() should not be exported.';
export const UNEXPECTED_ARGUMENT =
  'Unexpected argument passed to the stylex() function.';
export const EXPECTED_FUNCTION_CALL =
  'Expected a simple function call but found something else.';
export const NO_PARENT_PATH = 'Unexpected AST node without a parent path.';
export const DUPLICATE_CONDITIONAL =
  'The same pseudo selector or at-rule cannot be used more than once.';
export const NO_PROJECT_ROOT_DIRECTORY =
  'The project root directory `rootDir` is not configured.';
export const NON_EXPORT_NAMED_DECLARATION =
  'The return value of stylex.defineVars() must be bound to a named export.';
export const ANONYMOUS_THEME =
  'stylex.createTheme() must be bound to a named constant.';
export const ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS =
  'Only named parameters are allowed in Dynamic Style functions. Destructuring, spreading or default values are not allowed.';
export const NON_CONTIGUOUS_VARS =
  'All variables passed to `stylex.firstThatWorks` must be contiguous.';
