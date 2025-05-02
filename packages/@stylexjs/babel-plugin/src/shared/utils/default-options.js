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
  enableDebugDataProp: true,
  enableFontSizePxToRem: true,
  enableMinifiedKeys: true,
  styleResolution: 'application-order',
  test: false,
};
