/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  publicDir: path.resolve(rootDir, 'public'),
  build: {
    outDir: path.resolve(rootDir, 'extension'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        devtools: path.resolve(rootDir, 'devtools.html'),
        panel: path.resolve(rootDir, 'panel.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    stylex.vite({ devMode: 'off' }),
    react({
      babel: {
        babelrc: true,
        plugins: ['@babel/plugin-transform-flow-strip-types'],
      },
    }),
  ],
});
