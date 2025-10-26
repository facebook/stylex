/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Rule } from '@stylexjs/babel-plugin';

import path from 'node:path';
import * as babel from '@babel/core';
import styleXPlugin from '@stylexjs/babel-plugin';
import {
  copyFile,
  getInputDirectoryFiles,
  isJSFile,
  writeCompiledCSS,
  writeCompiledJS,
  getRelativePath,
  isDir,
} from './files';
import type { TransformConfig } from './config';
import ansis from 'ansis';
import fs from 'node:fs';
import {
  writeCache,
  readCache,
  computeFilePathHash,
  computeStyleXConfigHash,
  computeBabelRCHash,
  getDefaultCachePath,
} from './cache';
import {
  createImportPlugin,
  createModuleImportModifierPlugin,
} from './plugins';

export async function compileDirectory(
  config: TransformConfig,
  filesToCompile?: Array<string>,
  filesToDelete?: Array<string>,
) {
  if (filesToDelete) {
    filesToDelete.forEach((file) => {
      config.state.styleXRules.delete(file);
      const outputPath = path.join(config.output, file);
      if (fs.existsSync(outputPath)) {
        try {
          fs.rmSync(outputPath);
        } catch (err) {
          console.error('[stylex] failed to delete file: ', err);
        }
      }
    });
  }
  const dirFiles = filesToCompile ?? getInputDirectoryFiles(config.input);
  for (const filePath of dirFiles) {
    const parsed = path.parse(filePath);
    if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
      console.log(
        `${ansis.green('[stylex]')} transforming ${path.join(config.input, filePath)}`,
      );
      try {
        await compileFile(filePath, config);
      } catch (transformError) {
        throw transformError;
      }
    } else {
      const src = path.join(config.input, filePath);
      const dst = path.join(config.output, filePath);
      if (!isDir(src)) {
        console.log(
          `${ansis.green('[stylex]')} copying ${path.join(config.input, filePath)}`,
        );
        copyFile(src, dst);
      }
    }
  }

  const compiledCSS = await styleXPlugin.processStylexRules(
    Array.from(config.state.styleXRules.values()).flat(),
    {
      useLayers: config.useCSSLayers,
      enableLTRRTLComments: config.styleXConfig?.enableLTRRTLComments,
    },
  );

  const cssBundlePath = path.join(config.output, config.styleXBundleName);
  if (config.state.compiledCSSDir == null) {
    config.state.compiledCSSDir = cssBundlePath;
  }
  writeCompiledCSS(
    config.state.compiledCSSDir != null
      ? config.state.compiledCSSDir
      : cssBundlePath,
    compiledCSS,
  );
}

export async function compileFile(
  filePath: string,
  config: TransformConfig,
): Promise<?string> {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(config.output, filePath);
  const cachePath = config.cachePath || getDefaultCachePath();

  const inputHash = await computeFilePathHash(inputFilePath);
  let oldOutputHash = null;
  if (fs.existsSync(outputFilePath)) {
    oldOutputHash = await computeFilePathHash(outputFilePath);
  }

  const configHash = computeStyleXConfigHash(config);
  const babelHash = await computeBabelRCHash(inputFilePath);

  const cacheData = await readCache(cachePath, filePath);

  if (
    cacheData &&
    cacheData.inputHash === inputHash &&
    oldOutputHash &&
    cacheData.outputHash === oldOutputHash &&
    cacheData.configHash === configHash &&
    cacheData.babelHash === babelHash
  ) {
    console.log(`[stylex] Using cached CSS for: ${filePath}`);
    config.state.styleXRules.set(filePath, cacheData.collectedCSS);
    return;
  }

  const [code, rules] = await transformFile(
    inputFilePath,
    outputFilePath,
    config,
  );

  if (code != null) {
    config.state.compiledJS.set(filePath, code);
    config.state.styleXRules.set(filePath, rules);

    writeCompiledJS(outputFilePath, code);

    const newOutputHash = await computeFilePathHash(outputFilePath);

    await writeCache(cachePath, filePath, {
      inputHash,
      outputHash: newOutputHash,
      collectedCSS: rules,
      configHash,
      babelHash,
    });
  }
}

export async function transformFile(
  inputFilePath: string,
  outputFilePath: string,
  config: TransformConfig,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getRelativePath(
    outputFilePath,
    config.state.compiledCSSDir != null
      ? config.state.compiledCSSDir
      : path.join(config.output, config.styleXBundleName),
  );

  const result = await babel.transformFileAsync(inputFilePath, {
    babelrc: false,
    presets: config.babelPresets,
    plugins: [
      ...(config.babelPluginsPre ?? []),
      createModuleImportModifierPlugin(outputFilePath, config),
      [
        styleXPlugin,
        {
          unstable_moduleResolution: {
            type: 'commonJS',
            // This assumes that your input and output are in the same directory
            rootDir: path.parse(config.output).dir,
          },
          ...(config.styleXConfig as $FlowFixMe),
          rewriteAliases: true,
        },
      ],
      createImportPlugin(relativeImport),
      ...(config.babelPluginsPost ?? []),
    ],
  });
  if (result == null) {
    throw new Error(`[stylex] failed to transform file ${inputFilePath}`);
  }
  const { code, metadata } = result;

  const styleXRules: Array<Rule> = (metadata as $FlowFixMe).stylex;

  return [code, styleXRules];
}
