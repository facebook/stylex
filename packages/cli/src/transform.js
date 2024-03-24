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
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import typescriptPlugin from '@babel/plugin-transform-typescript';
import styleXPlugin from '@stylexjs/babel-plugin';
import {
  copyFile,
  getInputDirectoryFiles,
  isJSFile,
  writeCompiledCSS,
  writeCompiledJS,
  getRelativePath,
} from './files';
import type { Config } from './config';
import chalk from 'chalk';
import fs from 'fs';
import {
  createImportPlugin,
  createModuleImportModifierPlugin,
} from './plugins';

const allStyleXRules = new Map<string, Array<Rule>>();
const compiledJS = new Map<string, string>();

export async function compileDirectory(
  config: Config,
  filesToCompile?: Array<string>,
  filesToDelete?: Array<string>,
) {
  console.log(allStyleXRules.keys());
  if (filesToDelete) {
    filesToDelete.forEach((file) => {
      allStyleXRules.delete(file);
      fs.rmSync(path.join(config.output, file));
    });
  }
  try {
    const dirFiles = filesToCompile ?? getInputDirectoryFiles(config.input);
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log(
          `${chalk.green('[stylex]')} transforming ${path.join(config.input, filePath)}`,
        );
        await compileFile(filePath, config);
      } else {
        const src = path.join(config.input, filePath);
        const dst = path.join(
          config.compiledModuleOutput ?? config.output,
          filePath,
        );
        copyFile(src, dst);
      }
    }
    const compiledCSS = await styleXPlugin.processStylexRules(
      Array.from(allStyleXRules.values()).flat(),
    );

    const cssBundlePath = path.join(config.output, config.cssBundleName);
    writeCompiledCSS(cssBundlePath, compiledCSS);
  } catch (err) {
    fs.rmSync(config.output, { recursive: true, force: true });
    throw err;
  }
}

export async function compileFile(
  filePath: string,
  config: Config,
): Promise<?string> {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(
    config.compiledModuleOutput ?? config.output,
    filePath,
  );

  const [code, rules] = await transformFile(
    inputFilePath,
    outputFilePath,
    config,
  );
  if (code != null) {
    compiledJS.set(filePath, code);
    allStyleXRules.set(filePath, rules);
    writeCompiledJS(outputFilePath, code);
  }
}

export async function transformFile(
  inputFilePath: string,
  outputFilePath: string,
  config: Config,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getRelativePath(
    inputFilePath,
    path.join(config.output, config.cssBundleName),
  );
  const result = await babel.transformFileAsync(inputFilePath, {
    babelrc: false,
    plugins: [
      createModuleImportModifierPlugin(outputFilePath, config),
      jsxSyntaxPlugin,
      [typescriptPlugin, { isTSX: true }],
      [
        styleXPlugin,
        {
          unstable_moduleResolution: {
            type: 'commonJS',
            // This assumes that your input and output are at the same level
            rootDir: path.parse(config.output).dir,
          },
        },
      ],
      // typescriptPlugin to resolve aliases
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
