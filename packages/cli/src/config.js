#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Rule } from '@stylexjs/babel-plugin';

export type ModuleType =
  | string
  | $ReadOnly<[string, ?$ReadOnly<{ ignore?: $ReadOnlyArray<string> }>]>;

export type CliConfig = {
  input: $ReadOnlyArray<string>,
  output: $ReadOnlyArray<string>,
  styleXBundleName: string,
  watch: boolean,
  babelPresets: $ReadOnlyArray<any>,
  babelPluginsPre?: $ReadOnlyArray<any>,
  babelPluginsPost?: $ReadOnlyArray<any>,
  modules_EXPERIMENTAL: $ReadOnlyArray<ModuleType>,
  useCSSLayers?: boolean,
  styleXConfig?: { +[string]: mixed },
};

export type TransformConfig = {
  ...CliConfig,
  input: string,
  output: string,
  state: {
    compiledCSSDir: ?string,
    compiledNodeModuleDir: ?string,
    styleXRules: Map<string, Array<Rule>>,
    compiledJS: Map<string, string>,
    copiedNodeModules: boolean,
  },
};
