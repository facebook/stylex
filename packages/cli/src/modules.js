#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { Config } from './config';

import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

// "@stylexjs/open-props" -> "[absolute_path]/node_modules/@stylexjs/open-props"
// can't just require.resolve because that will error on modules that don't have "main" defined in package.json (like open-props)
export const findModuleDir = (moduleName: string, config: Config): string => {
  const packageName = moduleName.includes('/')
    ? moduleName.startsWith('@')
      ? moduleName.split('/').slice(0, 2).join('/')
      : moduleName.split('/')[0]
    : moduleName;
  // need to use this function because we need `require()` as if it was called in the input directory
  // else we will be calling it from wherever the cli is installed.
  // this is probably the same directory in most cases but ¯\_(ツ)_/¯
  const require = createRequire(config.input);
  const possiblePaths = require.resolve
    // $FlowFixMe[prop-missing]
    .paths(moduleName)
    .map((p) => path.join(p, packageName));
  return possiblePaths.find((p) => fs.existsSync(p));
};
