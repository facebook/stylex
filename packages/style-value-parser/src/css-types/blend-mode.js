/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser } from '../core';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export const blendMode: Parser<BlendMode> = Parser.oneOf(
  Parser.string('normal'),
  Parser.string('multiply'),
  Parser.string('screen'),
  Parser.string('overlay'),
  Parser.string('darken'),
  Parser.string('lighten'),
  Parser.string('color-dodge'),
  Parser.string('color-burn'),
  Parser.string('hard-light'),
  Parser.string('soft-light'),
  Parser.string('difference'),
  Parser.string('exclusion'),
  Parser.string('hue'),
  Parser.string('saturation'),
  Parser.string('color'),
  Parser.string('luminosity'),
);
