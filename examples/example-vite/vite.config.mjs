/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [stylex.vite(), react()],
  build: {
    // Ensure CSS is extracted into assets (default), we also import src/index.css
  },
});
