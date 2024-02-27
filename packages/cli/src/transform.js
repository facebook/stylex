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
import * as t from '@babel/types';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import typescriptPlugin from '@babel/plugin-transform-typescript';
import styleXPlugin from '@stylexjs/babel-plugin';
import type { NodePath } from '@babel/traverse';
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

type StyleXRules = Array<Rule>;

export async function transformFile(
  filePath: string,
  config: Config,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getCssPathFromFilePath(filePath, config);

  const importDeclaration = t.importDeclaration(
    [],
    t.stringLiteral(relativeImport),
  );

  const addImportPlugin = () => ({
    visitor: {
      Program: {
        enter(path: NodePath<t.Program>) {
          path.node.body.unshift(importDeclaration);
        },
      },
    },
  });

  const result = await babel.transformFileAsync(filePath, {
    babelrc: false,
    plugins: [
      jsxSyntaxPlugin,
      [typescriptPlugin, { isTSX: true }],
      // TODO: Add support for passing in a custom config file
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
      addImportPlugin,
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

const allStyleXRules: StyleXRules = [];
const compiledJS = new Map<string, string>();

export async function compileDirectory(config: Config) {
  try {
    const cssBundlePath = path.join(config.output, config.cssBundleName);
    const dirFiles = getInputDirectoryFiles(config.input);
    writeCompiledCSS(cssBundlePath, '');
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      // TODO: add support for also transforming a list of node_modules as well
      // compile node_modules then update imports of those modules to compiled version
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log('transforming', filePath);
        await compileFile(filePath, config);
      } else {
        copyFile(filePath, config);
      }
    }
    const compiledCSS = await compileRules(allStyleXRules);
    writeCompiledCSS(cssBundlePath, compiledCSS);
  } catch (err) {
    removeCompiledDir(config);
    throw err;
  }
}

export async function compileFile(filePath: string, config: Config) {
  const inputFilePath = path.join(config.input, filePath);
  const outputFilePath = path.join(config.output, filePath);
  const [code, rules] = await transformFile(inputFilePath, config);
  if (code != null) {
    compiledJS.set(filePath, code);
    allStyleXRules.push(...rules);
    writeCompiledJS(outputFilePath, code);
  }
}
