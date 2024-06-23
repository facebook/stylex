/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Rule } from '@stylexjs/babel-plugin';

import path from 'path';
import * as babel from '@babel/core';
import styleXPlugin from '@stylexjs/babel-plugin';
import {
  copyFile,
  getInputDirectoryFiles,
  isJSFile,
  writeCompiledCSS,
  writeCompiledJS,
  getRelativePath,
} from './files';
import type { TransformConfig } from './config';
import ansis from 'ansis';
import fs from 'fs';
import {
  createImportPlugin,
  createModuleImportModifierPlugin,
} from './plugins';
import { clearInputModuleDir } from './modules';

export async function compileDirectory(
  config: TransformConfig,
  filesToCompile?: Array<string>,
  filesToDelete?: Array<string>,
) {
  if (filesToDelete) {
    filesToDelete.forEach((file) => {
      config.state.styleXRules.delete(file);
      fs.rmSync(path.join(config.output, file));
    });
  }
  try {
    const dirFiles = filesToCompile ?? getInputDirectoryFiles(config.input);
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log(
          `${ansis.green('[stylex]')} transforming ${path.join(config.input, filePath)}`,
        );
        await compileFile(filePath, config);
      } else {
        const src = path.join(config.input, filePath);
        const dst = path.join(config.output, filePath);
        copyFile(src, dst);
      }
    }
    const compiledCSS = await styleXPlugin.processStylexRules(
      Array.from(config.state.styleXRules.values()).flat(),
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
  } catch (err) {
    fs.rmSync(config.output, { recursive: true, force: true });
    clearInputModuleDir(config);
    throw err;
  }
}

export async function compileFile(
  filePath: string,
  config: TransformConfig,
): Promise<?string> {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(config.output, filePath);

  const [code, rules] = await transformFile(
    inputFilePath,
    outputFilePath,
    config,
  );
  if (code != null) {
    config.state.compiledJS.set(filePath, code);
    config.state.styleXRules.set(filePath, rules);
    writeCompiledJS(outputFilePath, code);
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
      createModuleImportModifierPlugin(outputFilePath, config),
      [
        styleXPlugin,
        {
          unstable_moduleResolution: {
            type: 'commonJS',
            // This assumes that your input and output are in the same directory
            rootDir: path.parse(config.output).dir,
          },
        },
      ],
      createImportPlugin(relativeImport),
    ],
  });
  if (result == null) {
    throw new Error(`Failed to transform file ${inputFilePath}`);
  }
  const { code, metadata } = result;

  const styleXRules: Array<Rule> = (metadata as $FlowFixMe).stylex;
  return [code, styleXRules];
}
