/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const WebpackPluginStylex = require('./custom-webpack-plugin');

let count = 0;

module.exports =
  ({ rootDir, filename = 'stylex-bundle.css', aliases }) =>
  (nextConfig = {}) => {
    return {
      ...nextConfig,
      webpack(config, options) {
        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, options);
        }

        const { buildId, dev, isServer } = options;

        console.log(
          [
            'GETTING WEBPACK CONFIG',
            '======================',
            `Count: ${++count}`,
            `Build ID: ${buildId}`,
            `Server: ${isServer}`,
            `Env: ${dev ? 'dev' : 'prod'}`,
          ].join('\n'),
        );

        config.optimization.splitChunks ||= { cacheGroups: {} };
        if (config.optimization.splitChunks?.cacheGroups?.styles) {
          config.optimization.splitChunks.cacheGroups.styles = {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          };
        }

        const webpackPluginOptions = {
          babelConfig: {
            babelrc: true,
            buildId,
            isServer,
            count,
            dev,
          },
          aliases,
          rootDir,
          appendTo: (name) => name.endsWith('.css'),
          filename,
          dev,
        };

        const stylexPlugin = new WebpackPluginStylex(webpackPluginOptions);
        config.plugins.push(stylexPlugin);

        return config;
      },
    };
  };
