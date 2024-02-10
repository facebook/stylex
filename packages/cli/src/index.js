#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

// import watchman from 'fb-watchman';
import {
  getInputDirectoryFiles,
  isDir,
  makeCompiledDir,
  writeCompiledCSS,
  writeCompiledJS,
} from './files';
import { compileRules, transformFile } from './transform';
import yargs from 'yargs';

import path from 'path';

import type { Rule } from '@stylexjs/babel-plugin';
import errors from './errors';

// Rough list of steps

// Walk through files
//  Compile all of them with stylex babel plugin
// When using babel plugin with transform/transformSync,
// Has metadata key/object, which may have stylex key
//  Stylex object has styles generated in each file
// Pass them to processCSS in function and write return to output
// Import css in every  file relative to file path

// make watchman look for directory changes
// create cache from time changed on files and recompile only those files?

// Accept list of node_modules files to ALSO compile and include in the css
// Make a subfolder inside of output of compiled_modules
// Can skip injecting css import in compiled_modules

type StyleXRules = Array<Rule>;

const usage =
  '\n Usage: provide a directory to stylex in order to have it compiled.';
const _options = yargs
  .usage(usage)
  .option('d', {
    alias: 'directory',
    describe: 'The directory to compile with Stylex',
    type: 'string',
    demandOption: true,
  })
  .help(true).argsv;

const dir: string = yargs.argv.directory;
if (!isDir(dir)) {
  throw errors.dirNotFound;
}

export const INPUT_DIR: string = path.normalize(dir);

const inputParent: string = path.dirname(INPUT_DIR);

export const COMPILED_DIR: string = path.join(inputParent, 'src');
export const CSS_FILE_PATH: string = path.join(
  COMPILED_DIR,
  'stylex-bundle.css',
);

makeCompiledDir(COMPILED_DIR);
const allStyleXRules: StyleXRules = [];
const compiledJS = new Map<string, string>();

// without watch flag
compileDirectory(dir);

async function compileDirectory(dir: string) {
  const dirFiles = getInputDirectoryFiles(dir);
  for (const file of dirFiles) {
    await compileFile(file);
  }
  const compiledCSS = await compileRules(allStyleXRules);
  writeCompiledCSS(CSS_FILE_PATH, compiledCSS);
}

async function compileFile(filePath: string) {
  const [code, rules] = await transformFile(dir, path.join(dir, filePath));
  if (code != null) {
    compiledJS.set(filePath, code);
    allStyleXRules.push(...rules);
    writeCompiledJS(path.join(COMPILED_DIR, filePath), code);
  }
}
