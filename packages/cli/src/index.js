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

const primary = '#5B45DE';
const secondary = '#D573DD';

console.log(
  chalk.hex(primary).bold(`\n
   .d8888b.  888             888         ${chalk.hex(secondary).bold('Y88b   d88P')} 
  d88P  Y88b 888             888          ${chalk.hex(secondary).bold('Y88b d88P')}  
  Y88b.      888             888           ${chalk.hex(secondary).bold('Y88o88P')}   
   "Y888b.   888888 888  888 888  .d88b.    ${chalk.hex(secondary).bold('Y888P')}    
      "Y88b. 888    888  888 888 d8P  Y8b   ${chalk.hex(secondary).bold('d888b')}    
        "888 888    888  888 888 88888888  ${chalk.hex(secondary).bold('d88888b')}   
  Y88b  d88P Y88b.  Y88b 888 888 Y8b.     ${chalk.hex(secondary).bold('d88P Y88b')}  
   "Y8888P"   "Y888  "Y88888 888  "Y8888 ${chalk.hex(secondary).bold('cd88P   Y88b')} 
                         888                         
                    Y8b d88P                         
                     "Y88P"          
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
