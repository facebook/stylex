/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

const root: any = globalThis;

export const usesPromiseApi: boolean =
  root.browser != null && root.browser.devtools != null;

export const extensionApi: any = usesPromiseApi ? root.browser : root.chrome;

if (extensionApi == null || extensionApi.devtools == null) {
  throw new Error('The WebExtension DevTools API is unavailable.');
}

export const devtools: any = extensionApi.devtools;

export function getExtensionUrl(path: string): string {
  return extensionApi.runtime.getURL(path);
}
