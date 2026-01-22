/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    sveltekit(),
    // @ts-expect-error - ignore for now
    {
      ...stylex.vite({
        useCSSLayers: true,
        enableFontSizePxToRem: true,
      }),
      enforce: undefined,
    },
  ],
});
