/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare module '@csstools/postcss-cascade-layers' {
  import type { Plugin } from 'postcss';
  declare type PluginCreator<T> = (opts?: T) => Plugin;
  declare type PluginOptions = {
    /** Emit a warning when the "revert" keyword is found in your CSS. default: "warn" */
    onRevertLayerKeyword?: 'warn' | false,
    /** Emit a warning when conditional rules could change the layer order. default: "warn" */
    onConditionalRulesChangingLayerOrder?: 'warn' | false,
    /** Emit a warning when "layer" is used in "@import". default: "warn" */
    onImportLayerRule?: 'warn' | false,
  };

  declare module.exports: PluginCreator<PluginOptions>;
}
