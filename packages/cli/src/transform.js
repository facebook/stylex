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
import styleXPlugin from '@stylexjs/babel-plugin';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import {
  copyFile,
  getCssPathFromFilePath,
  getInputDirectoryFiles,
  isJSFile,
  writeCompiledCSS,
  removeCompiledDir,
  writeCompiledJS,
} from './files';
import type { NodePath } from '@babel/traverse';

type StyleXRules = Array<Rule>;

export async function transformFile(
  dir: string,
  fileName: string,
): Promise<[?string, Array<Rule>]> {
  const relativeImport = getCssPathFromFilePath(fileName);

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

  const result = await babel.transformFileAsync(fileName, {
    babelrc: false,
    plugins: [
      [typescriptSyntaxPlugin, { isTSX: true }],
      jsxSyntaxPlugin,
      // TODO: Add support for passing in a custom config file
      [
        styleXPlugin,
        {
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: global.INPUT_DIR,
          },
        },
      ],
      addImportPlugin,
    ],
  });
  if (result == null) {
    throw new Error(`Failed to transform file ${fileName}`);
  }
  const { code, metadata } = result;

  const styleXRules: Array<Rule> = (metadata: $FlowFixMe).stylex;
  return [code, styleXRules];
}

export async function compileRules(rules: Array<Rule>): Promise<string> {
  return styleXPlugin.processStylexRules(rules);
}

const allStyleXRules: StyleXRules = [];
const compiledJS = new Map<string, string>();

export async function compileDirectory(dir: string) {
  try {
    const dirFiles = getInputDirectoryFiles(dir);
    writeCompiledCSS(global.CSS_BUNDLE_PATH, '');
    for (const filePath of dirFiles) {
      const parsed = path.parse(filePath);
      // TODO: add support for also transforming a list of node_modules as well
      if (isJSFile(filePath) && !parsed.dir.startsWith('node_modules')) {
        console.log('transforming', filePath);
        await compileFile(filePath);
      } else {
        copyFile(filePath);
      }
    }
    const compiledCSS = await compileRules(allStyleXRules);
    writeCompiledCSS(global.CSS_BUNDLE_PATH, compiledCSS);
  } catch (err) {
    removeCompiledDir();
    throw err;
  }
}

export async function compileFile(filePath: string) {
  const [code, rules] = await transformFile(
    global.INPUT_DIR,
    path.join(global.INPUT_DIR, filePath),
  );
  if (code != null) {
    compiledJS.set(filePath, code);
    allStyleXRules.push(...rules);
    writeCompiledJS(path.join(global.COMPILED_DIR, filePath), code);
  }
}
