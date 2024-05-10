#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Argv } from 'yargs';
import type { Rule } from '@stylexjs/babel-plugin';
import yargs from 'yargs';
import path from 'path';
import chalk from 'chalk';
import JSON5 from 'json5';

import { isDir } from './files';
import { compileDirectory } from './transform';
import options from './options';
import errors from './errors';
import watcher from './watcher';
import fs from 'fs';
import { clearInputModuleDir, copyNodeModules } from './modules';
import type { CliConfig, TransformConfig } from './config';

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
const args: Argv = yargs(process.argv)
  .scriptName('stylex')
  .usage(usage)
  // $FlowFixMe[incompatible-call] Flow typings for Yargs doesn't infer options type, it requires {[key: string]: Options}, but Typescript can infer options<MyOptions>. I'd rather FlowFixMe than cast
  .options(options)
  .help(true)
  .config(
    'config',
    'path of a .json (or .json5) config file',
    (configPath: string) => {
      return JSON5.parse(fs.readFileSync(configPath));
    },
  )
  .parseSync();

const absolutePath = process.cwd();

const input: Array<string> = args.input;
const output: Array<string> = args.output;
const watch: boolean = args.watch;
const styleXBundleName: string = args.styleXBundleName;
const modules_EXPERIMENTAL: Array<string> = args.modules_EXPERIMENTAL;
const babelPresets: Array<any> = args.babelPresets;

const cliArgsConfig: CliConfig = {
  input,
  output,
  modules_EXPERIMENTAL,
  watch,
  styleXBundleName,
  babelPresets,
};

styleXCompile(cliArgsConfig);

async function styleXCompile(cliArgsConfig: CliConfig) {
  if (cliArgsConfig.input.length !== cliArgsConfig.output.length) {
    throw errors.inputOutputMismatch;
  }
  const configState = {
    compiledCSSDir: null,
    compiledNodeModuleDir: null,
    compiledJS: new Map<string, string>(),
    styleXRules: new Map<string, Array<Rule>>(),
    copiedNodeModules: false,
  };
  for (let i = 0; i < cliArgsConfig.input.length; i++) {
    const inputPath = path.isAbsolute(cliArgsConfig.input[i])
      ? cliArgsConfig.input[i]
      : path.normalize(path.join(absolutePath, cliArgsConfig.input[i]));
    const outputPath = path.isAbsolute(cliArgsConfig.output[i])
      ? cliArgsConfig.output[i]
      : path.normalize(path.join(absolutePath, cliArgsConfig.output[i]));
    const config: TransformConfig = {
      input: inputPath,
      output: outputPath,
      modules_EXPERIMENTAL,
      watch,
      styleXBundleName,
      babelPresets,
      state: configState,
    };
    if (!isDir(config.input)) {
      throw errors.dirNotFound;
    }
    if (!config.state.copiedNodeModules) {
      config.state.copiedNodeModules = copyNodeModules(config);
    }
    if (config.watch) {
      watcher(config);
    } else {
      await compileDirectory(config);
      if (config.state.copiedNodeModules) {
        clearInputModuleDir(config);
      }
    }
  }
}
