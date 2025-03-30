/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/** @type {import('next').NextConfig} */

const path = require('path');

module.exports = {
  transpilePackages: ['@stylexjs/open-props'],
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { dev, isServer }) => {
    // Process only files that require StyleX compilation using babel-loader
    config.module.rules.push({
      test: /\.(tsx|stylex\.ts|jsx|stylex\.js)$/,
      exclude: /node_modules(?!\/@stylexjs\/open-props)/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            parserOpts: {
              plugins: ['typescript', 'jsx'],
            },
            plugins: [
              [
                '@stylexjs/babel-plugin',
                {
                  dev: dev,
                  runtimeInjection: false,
                  genConditionalClasses: true,
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
        },
      ],
    });

    return config;
  },
};
