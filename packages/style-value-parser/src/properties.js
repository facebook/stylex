/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { Parser, type FromParser } from './core';
import { cssWideKeywords } from './css-types/common-types';

export const appearance: Parser<
  | FromParser<typeof cssWideKeywords>
  | 'none'
  | 'auto'
  | 'menulist-button'
  | 'textfield',
> = Parser.oneOf(
  cssWideKeywords,
  Parser.string('none'),
  Parser.string('auto'),
  Parser.string('menulist-button'),
  Parser.string('textfield'),
);

export { Transform } from './properties/transform';
export { BoxShadow, BoxShadowList } from './properties/box-shadow';
export {
  BorderRadiusIndividual,
  BorderRadiusShorthand,
} from './properties/border-radius';
