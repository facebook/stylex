/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

'use strict';

import { devtools } from '../../flow-types/chrome.js';

export function createStylexSidebarPane(): void {
  devtools.panels.elements.createSidebarPane('StyleX', (pane) => {
    pane.setPage('panel.html');
    pane.setHeight(400);
  });
}
