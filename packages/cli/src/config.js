#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type Config = {
  input: string,
  output: string,
  cssBundleName: string,
  modules?: $ReadOnlyArray<string>,
  mode?: 'watch',
};
