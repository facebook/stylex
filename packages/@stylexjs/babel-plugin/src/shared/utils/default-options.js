/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from '../common-types';

export const defaultOptions: StyleXOptions = {
  classNamePrefix: 'x',
  dev: false,
  debug: false,
  enableDebugClassNames: true,
  enableDevClassNames: false,
  enableDebugDataProp: true,
  enableFontSizePxToRem: false,
  enableMediaQueryOrder: false,
  softMediaQueryValidation: false,
  enableLegacyValueFlipping: false,
  enableLogicalStylesPolyfill: false,
  enableLTRRTLComments: false,
  enableMinifiedKeys: true,
  styleResolution: 'property-specificity',
  test: false,
};
