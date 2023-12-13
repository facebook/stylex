/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import path from 'path';
import createHash from '@stylexjs/shared/lib/hash'
import { readFile, writeFile, mkdir } from 'fs/promises';
import { transformAsync, type PluginItem } from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import flowSyntaxPlugin from '@babel/plugin-syntax-flow';
import hermesParserPlugin from 'babel-plugin-syntax-hermes-parser';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import type { Options, Rule } from '@stylexjs/babel-plugin';
import type { Plugin, PluginBuild, BuildResult, OnLoadArgs } from 'esbuild';

const PACKAGE_NAME = 'esbuild-plugin-stylex';

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

const STYLEX_PLUGIN_ONLOAD_FILTER = /\.(jsx|js|tsx|ts|mjs|cjs|mts|cts)$/;

export type PluginOptions = $ReadOnly<{
  ...Partial<Options>,
  generatedCSSFileName?: string,
  stylexImports?: $ReadOnlyArray<string>,
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
  stylexImports = ['@stylexjs/stylex'],
  generatedCSSFileName = path.resolve(__dirname, 'stylex.css'),
  babelConfig: { plugins = [], presets = [] } = {},
  useCSSLayers,
  ...options
}: PluginOptions = {}): Plugin {
  return {
    name: PACKAGE_NAME,
    async setup(build: PluginBuild) {
      const stylexRules: { [string]: $ReadOnlyArray<Rule> } = {};

      build.onEnd(async ({ outputFiles }: BuildResult<>) => {
        const rules: Array<Rule> = Object.values(stylexRules).flat();

        if (rules.length === 0) {
          return;
        }

        const collectedCSS = stylexBabelPlugin.processStylexRules(
          rules,
          useCSSLayers,
        );
        const shouldWriteToDisk =
          build.initialOptions.write === undefined || build.initialOptions.write;

        if (shouldWriteToDisk) {
          await mkdir(path.dirname(generatedCSSFileName), {
            recursive: true,
          });
          await writeFile(generatedCSSFileName, collectedCSS, 'utf8');

          return;
        }

        if (outputFiles !== undefined) {
          outputFiles.push({
            path: '<stdout>',
            contents: new TextEncoder().encode(collectedCSS),
            hash: createHash(new Date().getTime().toString()),
            get text() {
              return collectedCSS;
            },
          });
        }
      });

      build.onLoad(
        { filter: STYLEX_PLUGIN_ONLOAD_FILTER },
        async (args: OnLoadArgs) => {
          const currFilePath = args.path;
          const inputCode = await readFile(currFilePath, 'utf8');

          if (
            !stylexImports.some((importName) => inputCode.includes(importName))
          ) {
            // avoid transform if file doesn't have stylex imports
            // esbuild proceeds to the next callback
            return;
          }

          const transformResult = await transformAsync(inputCode, {
            babelrc: false,
            filename: currFilePath,
            presets,
            plugins: [
              ...plugins,
              ...getFlowOrTypeScriptBabelSyntaxPlugins(currFilePath),
              jsxSyntaxPlugin,
              stylexBabelPlugin.withOptions({
                ...options,
                dev,
                unstable_moduleResolution,
              }),
            ],
          });

          const loader = getEsbuildLoader(currFilePath)

          if (transformResult === null) {
            console.warn('StyleX: transformAsync returned null')
            return { code: inputCode, loader }
          }

          const {code, metadata} = transformResult

          if (code === null) {
            console.warn('StyleX: transformAsync returned null code')
            return { code: inputCode, loader }
          }


          if (!dev && (metadata: $FlowFixMe).stylex !== null && (metadata: $FlowFixMe).stylex.length > 0) {
            stylexRules[args.path] = (metadata: $FlowFixMe).stylex;
          }

          return {
            contents: code,
            loader
          };
        },
      );
    },
  };
}

function getEsbuildLoader(fileName: string) {
  if (fileName.endsWith('.tsx')) {
    return 'tsx';
  }

  if (fileName.endsWith('.jsx')) {
    return 'jsx';
  }

  if (fileName.endsWith('ts')) {
    return 'ts';
  }

  return 'js';
}

function getFlowOrTypeScriptBabelSyntaxPlugins(fileName: string) {
  if (/\.jsx?/.test(path.extname(fileName))) {
    return [flowSyntaxPlugin, hermesParserPlugin];
  }

  return [[typescriptSyntaxPlugin, { isTSX: true }]];
}
