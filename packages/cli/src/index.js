#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import yargs from 'yargs';
import path from 'path';
import chalk from 'chalk';

import { isDir, makeCompiledDir } from './files';
import { compileDirectory } from './transform';
import options from './options';
import errors from './errors';
import watch from './watch';

console.log(
  chalk.green(`\n
  ______   _             _         __   __
  / ____| | |           | |        \\ \\ / /
 | (___   | |_   _   _  | |   ___   \\ V / 
  \\___ \\  | __| | | | | | |  / _ \\   > <  
  ____) | | |_  | |_| | | | |  __/  / . \\ 
 |_____/   \\__|  \\__, | |_|  \\___| /_/ \\_\\
                  __/ |                   
                 |___/                
`),
);

const usage =
  '\n Usage: provide a directory to stylex in order to have it compiled.';
const args = yargs(process.argv)
  .scriptName('stylex')
  .usage(usage)
  .options(options)
  .help(true)
  .parseSync();

const dir: string = args.directory;
const output: string = args.output;
const watchFiles: boolean = args.watch;

if (!isDir(dir)) {
  throw errors.dirNotFound;
}

global.INPUT_DIR = path.normalize(dir);
global.INPUT_PARENT = path.dirname(global.INPUT_DIR);
global.COMPILED_DIR = path.join(global.INPUT_PARENT, output ?? 'src');
global.CSS_BUNDLE_NAME = 'stylex_bundle.css';
global.CSS_BUNDLE_PATH = path.join(global.COMPILED_DIR, global.CSS_BUNDLE_NAME);

if (watchFiles) {
  watch();
} else {
  makeCompiledDir();
  compileDirectory(dir);
}
