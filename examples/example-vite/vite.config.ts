/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { stylexPlugin } from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    react({
      // Use Babel for React Fast Refresh in development
      babel: {
        plugins: [
          // Enable StyleX Babel plugin
          '@stylexjs/babel-plugin',
        ],
      },
    }),
    // Add StyleX unplugin for production builds and HMR
    stylexPlugin({
      // Use dev mode in development for better debugging
      dev: process.env.NODE_ENV === 'development',
      // Generate runtime styles during build
      runtimeInjection: false,
      // Support TypeScript path aliases
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    }),
  ],
  
  // Support TypeScript path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Ensure .stylex.js files are handled
  esbuild: {
    include: ['**/*.stylex.js'],
  },

  // Enable sourcemaps in development
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
  },
});