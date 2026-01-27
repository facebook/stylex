/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import bun, { createStylexBunPlugin } from './bun';
import esbuild from './esbuild';
import farm from './farm';
import rolldown from './rolldown';
import rollup from './rollup';
import rspack from './rspack';
import unloader from './unloader';
import vite from './vite';
import webpack from './webpack';
import { unpluginFactory } from './core';

const stylex = {
  bun: createStylexBunPlugin,
  esbuild,
  farm,
  rolldown,
  rollup,
  rspack,
  unloader,
  vite,
  webpack,
  raw: unpluginFactory,
};

export {
  bun,
  esbuild,
  farm,
  rolldown,
  rollup,
  rspack,
  unloader,
  vite,
  webpack,
  createStylexBunPlugin,
};
export { unpluginFactory } from './core';

export const unplugin = stylex;
export default stylex;
