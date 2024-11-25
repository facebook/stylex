/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        // TODO: Figure out a better way to write this
        './node_modules/@stylexjs/open-props/lib/**/*.{js,mjs}',
      ],
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
