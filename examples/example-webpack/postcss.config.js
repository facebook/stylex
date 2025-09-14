/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        './src/**/*.{js,jsx,ts,tsx}',
        // any other files that should be included
        // this should include NPM dependencies that use StyleX
      ],
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
