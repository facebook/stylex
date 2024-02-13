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

import { isDir, makeCompiledDir } from './files';
import { compileDirectory } from './transform';
import options from './options';
import errors from './errors';
import watch from './watch';
// make watchman look for directory changes
// create cache from time changed on files and recompile only those files?

// Accept list of node_modules files to ALSO compile and include in the css
// Make a subfolder inside of output of compiled_modules
// Can skip injecting css import in compiled_modules

const usage =
  '\n Usage: provide a directory to stylex in order to have it compiled.';
const _options = yargs.usage(usage).options(options).help(true);

const dir: string = yargs.argv.directory;
const output: string = yargs.argv.output;
const watchFiles: boolean = yargs.argv.watch;

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
  makeCompiledDir(global.COMPILED_DIR);
  compileDirectory(dir);
}
