/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function removeNulls<T>(arr: Array<T | undefined | null>): Array<T> {
  return arr.filter((x) => x != null) as any;
}
