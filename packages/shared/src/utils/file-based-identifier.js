/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow strict
 */

export default function genFileBasedIdentifier({
  fileName,
  exportName,
  key,
}: {
  +fileName: string,
  +exportName: string,
  +key?: string,
}): string {
  return `${fileName}//${exportName}${key != null ? `.${key}` : ''}`;
}
