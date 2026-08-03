/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { devtools, usesPromiseApi } from './browserApi';

function configurePane(pane: any): Promise<void> {
  const operations = [Promise.resolve(pane.setPage('panel.html'))];
  if (typeof pane.setHeight === 'function') {
    operations.push(Promise.resolve(pane.setHeight(400)));
  }
  return Promise.all(operations).then(() => {});
}

export async function createStylexSidebarPane(): Promise<void> {
  const elements = devtools.panels.elements;
  if (usesPromiseApi) {
    const pane = await elements.createSidebarPane('StyleX');
    await configurePane(pane);
    return;
  }

  await new Promise((resolve, reject) => {
    elements.createSidebarPane('StyleX', (pane) => {
      configurePane(pane).then(resolve, reject);
    });
  });
}
