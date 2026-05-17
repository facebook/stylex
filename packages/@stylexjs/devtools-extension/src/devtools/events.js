/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { devtools } from './api.js';

export function subscribeToSelectionAndNavigation(
  callback: () => mixed,
): () => void {
  devtools.panels.elements.onSelectionChanged.addListener(callback);
  devtools.network.onNavigated.addListener(callback);

  return () => {
    devtools.panels.elements.onSelectionChanged.removeListener(callback);
    devtools.network.onNavigated.removeListener(callback);
  };
}
