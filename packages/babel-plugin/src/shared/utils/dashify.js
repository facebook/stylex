/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export default function dashify(str: string): string {
  return str.replace(/(^|[a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
