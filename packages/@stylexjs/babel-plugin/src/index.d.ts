// Solves the issue: https://github.com/facebook/stylex/issues/889
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { PluginObj } from '@babel/core';
import type { StyleXOptions } from './utils/state-manager';
export type Options = StyleXOptions;
/**
 * Entry point for the StyleX babel plugin.
 */
declare function styleXTransform(): PluginObj;
declare function stylexPluginWithOptions(
  options: Partial<StyleXOptions>,
): [typeof styleXTransform, Partial<StyleXOptions>];
/**
 *
 * @param rules An array of CSS rules that has been generated and collected from all JS files
 * in a project
 * @returns A string that represents the final CSS file.
 *
 * This function take an Array of CSS rules, de-duplicates them, sorts them priority and generates
 * a final CSS file.
 *
 * When Stylex is correctly configured, the babel plugin will return an array of CSS rule objects.
 * You're expected to concatenate all the Rules into a single Array and use this function to convert
 * that into the final CSS file.
 *
 * End-users can choose to not use this function and use their own logic instead.
 */
export type Rule = [string, { ltr: string; rtl?: null | string }, number];
declare function processStylexRules(
  rules: Array<Rule>,
  useLayers: boolean,
): string;
export type StyleXTransformObj = Readonly<{
  (): PluginObj;
  withOptions: typeof stylexPluginWithOptions;
  processStylexRules: typeof processStylexRules;
}>;
declare const $$EXPORT_DEFAULT_DECLARATION$$: StyleXTransformObj;
export = $$EXPORT_DEFAULT_DECLARATION$$;
