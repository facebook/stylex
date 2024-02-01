/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import * as babel from '@babel/core';

export async function transformFile(filename: string): Promise<> {
  const result = await babel.transformFileAsync(filename, {});
  const { code, metadata } = result;
}
