/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import removeTestIdAttribute from 'rollup-plugin-jsx-remove-attributes';
import externals from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import type { PluginOption, UserConfig } from 'vite';

export const plugins = [
  react({
    babel: {
      babelrc: true,
    },
  }),
  dts({
    entryRoot: 'stories/',
  }),
  removeTestIdAttribute({
    attributes: ['data-testid'],
    usage: 'vite',
  }),
] as PluginOption[];

export const config: UserConfig = {
  plugins: [...plugins, externals()],
};

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    ...config,
  };
});
