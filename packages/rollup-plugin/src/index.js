/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import { transformAsync, type PluginItem } from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import flowSyntaxPlugin from '@babel/plugin-syntax-flow';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import path from 'path';
import type { Options, Rule } from '@stylexjs/babel-plugin';
import type { Plugin, PluginContext, TransformResult } from 'rollup';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

export type PluginOptions = $ReadOnly<{
  ...Partial<Options>,
  fileName?: string,
  babelConfig?: $ReadOnly<{
    plugins?: $ReadOnlyArray<PluginItem>,
    presets?: $ReadOnlyArray<PluginItem>,
  }>,
  useCSSLayers?: boolean,
  ...
}>;

export default function stylexPlugin({
  dev = IS_DEV_ENV,
  unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
  fileName = 'stylex.css',
  babelConfig: { plugins = [], presets = [] } = {},
  importSources = ['stylex', '@stylexjs/stylex'],
  useCSSLayers = false,
  ...options
}: PluginOptions = {}): Plugin<> {
  let stylexRules: { [string]: $ReadOnlyArray<Rule> } = {};
  return {
    name: 'rollup-plugin-stylex',
    buildStart() {
      stylexRules = {};
    },
    generateBundle(this: PluginContext) {
      const rules: Array<Rule> = Object.values(stylexRules).flat();
      if (rules.length > 0) {
        const collectedCSS = stylexBabelPlugin.processStylexRules(
          rules,
          useCSSLayers,
        );

        // This is the intended API, but Flow doesn't support this pattern.
        // $FlowExpectedError[object-this-reference]
        this.emitFile({
          fileName,
          source: collectedCSS,
          type: 'asset',
        });
      }
    },
    shouldTransformCachedModule({ code: _code, id, meta }) {
      stylexRules[id] = meta.stylex;
      return false;
    },
    async transform(inputCode, id): Promise<null | TransformResult> {
      if (
        !importSources.some((importName) =>
          typeof importName === 'string'
            ? inputCode.includes(importName)
            : inputCode.includes(importName.from),
        )
      ) {
        // In rollup, returning null from any plugin phase means
        // "no changes made".
        return null;
      }

      const result = await transformAsync(inputCode, {
        babelrc: false,
        filename: id,
        presets,
        plugins: [
          ...plugins,
          /\.jsx?/.test(path.extname(id))
            ? flowSyntaxPlugin
            : typescriptSyntaxPlugin,
          jsxSyntaxPlugin,
          stylexBabelPlugin.withOptions({
            ...options,
            dev,
            unstable_moduleResolution,
          }),
        ],
      });
      if (result == null) {
        console.warn('stylex: transformAsync returned null');
        return { code: inputCode };
      }
      const { code, map, metadata } = result;
      if (code == null) {
        console.warn('stylex: transformAsync returned null code');
        return { code: inputCode };
      }

      if (
        !dev &&
        (metadata: $FlowFixMe).stylex != null &&
        (metadata: $FlowFixMe).stylex.length > 0
      ) {
        stylexRules[id] = (metadata: $FlowFixMe).stylex;
      }

      return { code, map: (map: $FlowFixMe), meta: (metadata: $FlowFixMe) };
    },
  };
}
