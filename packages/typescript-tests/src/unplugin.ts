/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import stylex, { unpluginFactory, type UserOptions } from '@stylexjs/unplugin';
import viteStylex from '@stylexjs/unplugin/vite';

const options = {
  externalPackages: ['@acme/components'],
  useCSSLayers: true,
} satisfies Partial<UserOptions>;

stylex.vite(options);
stylex.rollup({ externalPackages: ['@acme/components'] });
viteStylex({ externalPackages: ['@acme/components'] });
unpluginFactory(
  { externalPackages: ['@acme/components'] },
  { framework: 'vite' },
);
