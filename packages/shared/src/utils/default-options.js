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
  dev: false,
  debug: false,
  useRemForFontSize: true,
  test: false,
  classNamePrefix: 'x',
  styleResolution: 'application-order',
};
