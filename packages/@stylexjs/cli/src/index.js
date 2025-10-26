#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Rule, Options as StyleXOptions } from '@stylexjs/babel-plugin';
import yargs from 'yargs';
import path from 'node:path';
import ansis from 'ansis';
import JSON5 from 'json5';
import { isDir } from './files';
import { compileDirectory } from './transform';
import options from './options';
import errors from './errors';
import { startWatcher } from './watcher';
import fs from 'node:fs';
import { clearInputModuleDir, copyNodeModules } from './modules';
import type { CliConfig, ModuleType, TransformConfig } from './config';

const primary = '#5B45DE';
const secondary = '#D573DD';

console.log(
  ansis.hex(primary).bold(`\n
   .d8888b.  888             888         ${ansis.hex(secondary).bold('Y88b   d88P')}
  d88P  Y88b 888             888          ${ansis.hex(secondary).bold('Y88b d88P')}
  Y88b.      888             888           ${ansis.hex(secondary).bold('Y88o88P')}
   "Y888b.   888888 888  888 888  .d88b.    ${ansis.hex(secondary).bold('Y888P')}
      "Y88b. 888    888  888 888 d8P  Y8b   ${ansis.hex(secondary).bold('d888b')}
        "888 888    888  888 888 88888888  ${ansis.hex(secondary).bold('d88888b')}
  Y88b  d88P Y88b.  Y88b 888 888 Y8b.     ${ansis.hex(secondary).bold('d88P Y88b')}
   "Y8888P"   "Y888  "Y88888 888  "Y8888 ${ansis.hex(secondary).bold('cd88P   Y88b')}
                         888
                    Y8b d88P
                     "Y88P"
`),
);

const usage =
  '\n Usage: provide a directory to stylex in order to have it compiled.';
let config: { +[string]: mixed } = {};
const args = yargs(process.argv)
  .scriptName('stylex')
  .usage(usage)
  // $FlowFixMe[incompatible-call]
  .options(options)
  .help(true)
  .config(
    'config',
    'path of a .json (or .json5) config file',
    (configPath: string) => {
      config = JSON5.parse(fs.readFileSync(configPath));
      return config;
    },
  )
  .parseSync();

const absolutePath = process.cwd();

const input: $ReadOnlyArray<string> = args.input;
const output: $ReadOnlyArray<string> = args.output;
const watch: boolean = args.watch;
const styleXBundleName: string = args.styleXBundleName;
const modules_EXPERIMENTAL: $ReadOnlyArray<ModuleType> =
  args.modules_EXPERIMENTAL;
const babelPresets: $ReadOnlyArray<any> = args.babelPresets;
const babelPluginsPre: $ReadOnlyArray<any> = args.babelPluginsPre;
const babelPluginsPost: $ReadOnlyArray<any> = args.babelPluginsPost;
const useCSSLayers: boolean = args.useCSSLayers;
const styleXConfig: StyleXOptions = (config.styleXConfig as $FlowFixMe) ?? {};

const cliArgsConfig: CliConfig = {
  input,
  output,
  modules_EXPERIMENTAL,
  watch,
  styleXBundleName,
  babelPresets,
  babelPluginsPre,
  babelPluginsPost,
  useCSSLayers,
  styleXConfig,
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
    const styleXConfig = cliArgsConfig.styleXConfig;
    if (
      styleXConfig?.aliases != null &&
      typeof styleXConfig.aliases === 'object'
    ) {
      const aliases: $FlowFixMe = styleXConfig.aliases;
      Object.keys(aliases).forEach((key) => {
        aliases[key] = aliases[key].map((alias) => {
          return path.isAbsolute(alias)
            ? alias
            : path.normalize(path.join(absolutePath, alias));
        });
      });
    }

    const config: TransformConfig = {
      input: inputPath,
      output: outputPath,
      modules_EXPERIMENTAL,
      watch,
      styleXBundleName,
      babelPresets,
      babelPluginsPre,
      babelPluginsPost,
      useCSSLayers,
      styleXConfig,
      state: configState,
    };
    if (!isDir(config.input)) {
      throw errors.dirNotFound;
    }
    if (!config.state.copiedNodeModules) {
      config.state.copiedNodeModules = copyNodeModules(config);
    }
    if (config.watch) {
      startWatcher(config);
    } else {
      try {
        await compileDirectory(config);
        if (config.state.copiedNodeModules) {
          clearInputModuleDir(config);
        }
      } catch (err) {
        fs.rmSync(config.output, { recursive: true, force: true });
        clearInputModuleDir(config);
        throw err;
      }
    }
  }
}
