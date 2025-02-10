/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { TokenIdent } from '@csstools/css-tokenizer';

import { TokenParser } from '../core2';
import { TokenType } from '@csstools/css-tokenizer';

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

export const blendMode: TokenParser<BlendMode> = TokenParser.token<TokenIdent>(
  TokenType.Ident,
)
  .map((v): string => v[4].value)
  .where<BlendMode>(
    (str): str is BlendMode =>
      str === 'normal' ||
      str === 'multiply' ||
      str === 'screen' ||
      str === 'overlay' ||
      str === 'darken' ||
      str === 'lighten' ||
      str === 'color-dodge' ||
      str === 'color-burn' ||
      str === 'hard-light' ||
      str === 'soft-light' ||
      str === 'difference' ||
      str === 'exclusion' ||
      str === 'hue' ||
      str === 'saturation' ||
      str === 'color' ||
      str === 'luminosity',
  );
