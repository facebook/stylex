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
import JSON5 from 'json5';

import { isDir, makeCompiledDir } from './files';
import { compileDirectory } from './transform';
import options from './options';
import errors from './errors';
import watch from './watch';
import fs from 'fs';

export type Config = {
  input: string,
  output: string,
  cssBundleName: string,
  modules?: $ReadOnlyArray<string>,
  mode?: 'watch',
};

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

const inputDir: string = args.input;
const outputDir: string = args.output;
const watchFiles: boolean = args.watch;
const configFile: string = args.config;

const absolutePath = process.cwd();

if (configFile) {
  const jsonConfig = fs.readFileSync(configFile);
  const parsed: Config = JSON5.parse(jsonConfig);
  // validate parsed input?
  const config = {
    input: path.normalize(path.join(absolutePath, parsed.input)),
    output: path.normalize(path.join(absolutePath, parsed.output)),
    cssBundleName: parsed.cssBundleName,
    mode: parsed.mode,
  };
  start(config);
} else {
  const config = {
    input: path.normalize(path.join(absolutePath, inputDir)),
    output: path.normalize(
      path.join(absolutePath, outputDir != null ? outputDir : 'src'),
    ),
    cssBundleName: 'stylex_bundle.css',
    mode: watchFiles ? 'watch' : undefined,
  };
  start(config);
}

// loading config automatically https://github.com/unjs/c12
// don't start with this

// use this to load the json
// https://json5.org/

// 1. json config

function start(config: Config) {
  if (!isDir(config.input)) {
    throw errors.dirNotFound;
  }
  if (config.mode === 'watch') {
    watch(config);
  } else {
    makeCompiledDir(config);
    compileDirectory(config);
  }
}
