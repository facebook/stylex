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
  getCssPathFromFilePath,
  getInputDirectoryFiles,
  isJSFile,
  writeCompiledCSS,
  removeCompiledDir,
  writeCompiledJS,
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
// map of compiled node_module directories to their package name
const compiledModules = new Map<string, string>();

export async function transformFile(
  filePath: string,
  outputFilepath: string,
  config: Config,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getCssPathFromFilePath(filePath, config);
  const result = await babel.transformFileAsync(filePath, {
    babelrc: false,
    plugins: [
      jsxSyntaxPlugin,
      [typescriptPlugin, { isTSX: true }],
      [
        styleXPlugin,
        {
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: config.input,
          },
        },
      ],
      // typescriptPlugin to resolve aliases
      createModuleImportModifierPlugin(compiledModules, outputFilepath, config),
      createImportPlugin(relativeImport),
    ],
  });
  if (result == null) {
    throw new Error(`Failed to transform file ${filePath}`);
  }
  const { code, metadata } = result;

  const styleXRules: Array<Rule> = (metadata as $FlowFixMe).stylex;
  return [code, styleXRules];
}

export async function compileRules(rules: Array<Rule>): Promise<string> {
  return styleXPlugin.processStylexRules(rules);
}

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
    const cssBundlePath = path.join(config.output, config.cssBundleName);
    const dirFiles = filesToCompile ?? getInputDirectoryFiles(config.input);
    writeCompiledCSS(cssBundlePath, '');
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log(
          `${chalk.green('[stylex]')} transforming ${path.join(config.input, filePath)}`,
        );
        await compileFile(filePath, config);
      } else {
        copyFile(filePath, config);
      }
    }
    const compiledCSS = await compileRules(
      Array.from(allStyleXRules.values()).flat(),
    );
    writeCompiledCSS(cssBundlePath, compiledCSS);
  } catch (err) {
    removeCompiledDir(config);
    throw err;
  }
}

export async function compileFile(filePath: string, config: Config) {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(config.output, filePath);
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

export async function compileModuleDirectory(
  config: Config,
  moduleName: string,
) {
  try {
    const cssBundlePath = path.join(config.output, config.cssBundleName);
    const dirFiles = getInputDirectoryFiles(config.input);
    writeCompiledCSS(cssBundlePath, '');
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log(
          `${chalk.magenta('[stylex]')} transforming node module at ${path.join(config.input, filePath)}`,
        );
        await compileModuleFile(filePath, config);
      } else {
        copyFile(filePath, config);
      }
      compiledModules.set(moduleName, config.output);
      console.log(compiledModules);
    }
    const compiledCSS = await compileRules(
      Array.from(allStyleXRules.values()).flat(),
    );
    writeCompiledCSS(cssBundlePath, compiledCSS);
  } catch (err) {
    removeCompiledDir(config);
    throw err;
  }
}

export async function compileModuleFile(filePath: string, config: Config) {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(config.output, filePath);
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
