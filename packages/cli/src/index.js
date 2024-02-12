#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Rule } from '@stylexjs/babel-plugin';

import watchman from './watchman';
import {
  getInputDirectoryFiles,
  isDir,
  isJSFile,
  copyFile,
  makeCompiledDir,
  writeCompiledCSS,
  writeCompiledJS,
} from './files';
import { compileRules, transformFile } from './transform';

import yargs from 'yargs';

import options from './options';

import path from 'path';

import errors from './errors';

// make watchman look for directory changes
// create cache from time changed on files and recompile only those files?

// Accept list of node_modules files to ALSO compile and include in the css
// Make a subfolder inside of output of compiled_modules
// Can skip injecting css import in compiled_modules

type StyleXRules = Array<Rule>;

const usage =
  '\n Usage: provide a directory to stylex in order to have it compiled.';
const _options = yargs.usage(usage).options(options).help(true).argsv;

const dir: string = yargs.argv.directory;
const output: string = yargs.argv.output;
const watch: boolean = yargs.argv.watch;

// fs will probably throw for this as well but ¯\_(ツ)_/¯
if (!isDir(dir)) {
  throw errors.dirNotFound;
}

global.INPUT_DIR = path.normalize(dir);
global.INPUT_PARENT = path.dirname(global.INPUT_DIR);
global.COMPILED_DIR = path.join(global.INPUT_PARENT, output);
global.CSS_BUNDLE_NAME = 'stylex_bundle.css';
global.CSS_BUNDLE_PATH = path.join(global.COMPILED_DIR, global.CSS_BUNDLE_NAME);

const allStyleXRules: StyleXRules = [];
const compiledJS = new Map<string, string>();

if (watch) {
  watchman();
} else {
  makeCompiledDir(global.COMPILED_DIR);
  compileDirectory(dir);
}

async function compileDirectory(dir: string) {
  const dirFiles = getInputDirectoryFiles(dir);
  for (const filePath of dirFiles) {
    if (isJSFile(filePath)) {
      await compileFile(filePath);
    } else {
      copyFile(filePath);
    }
  }
  const compiledCSS = await compileRules(allStyleXRules);
  writeCompiledCSS(global.CSS_BUNDLE_PATH, compiledCSS);
}

async function compileFile(filePath: string) {
  const [code, rules] = await transformFile(dir, path.join(dir, filePath));
  if (code != null) {
    compiledJS.set(filePath, code);
    allStyleXRules.push(...rules);
    writeCompiledJS(path.join(global.COMPILED_DIR, filePath), code);
  }
}
