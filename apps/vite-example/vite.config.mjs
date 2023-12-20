/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import { defineConfig } from 'vite';
import React from '@vitejs/plugin-react';
import StylexPlugin from '@stylexjs/vite-plugin';

export default defineConfig({
  plugins: [React(), StylexPlugin()],
});
