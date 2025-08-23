/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { StyleXOptions } from './common-types';
import { defaultOptions } from './utils/default-options';

export default function stylexDefaultMarker(
  options?: StyleXOptions = defaultOptions,
): { [string]: string | true } {
  const prefix =
    options.classNamePrefix != null ? `${options.classNamePrefix}-` : '';
  return {
    [`${prefix}default-marker`]: `${prefix}default-marker`,
    $$css: true,
  };
}
