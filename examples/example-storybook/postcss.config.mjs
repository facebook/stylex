/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import autoprefixer from 'autoprefixer'
import nesting from 'postcss-nesting'
import stylex from '@stylexjs/postcss-plugin'

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    nesting,
    stylex({
      include: ['stories/**/*.{ts,tsx}'],
      useCSSLayers: process.env.NODE_ENV !== 'production'
    }),
    autoprefixer
  ]
}

export default config
