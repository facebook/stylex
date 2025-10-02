/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const path = require('path');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: dev,
              runtimeInjection: false,
              treeshakeCompensation: true,
              aliases: {
                '@/*': [path.join(__dirname, '*')],
              },
              unstable_moduleResolution: {
                type: 'commonJS',
              },
            },
          ],
        ],
      },
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
