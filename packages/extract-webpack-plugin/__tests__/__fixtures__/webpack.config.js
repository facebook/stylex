/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const path = require('path');
const StylexPlugin = require('../../src/index');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    main: path.resolve(__dirname, './index.js'),
    other: path.resolve(__dirname, './other.js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, path.resolve(__dirname, './npmStyles.js')],
        use: {
          loader: require.resolve('babel-loader'),
        },
      },
    ],
  },
  plugins: [
    new StylexPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin()
  ],
  devtool: false, //'cheap-source-map',
  externals: {
    // Remove stylex runtime from bundle
    stylex: 'stylex',
  },
  mode: process.env.NODE_ENV ?? 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
  },
  optimization: {
    // Keep output readable
    minimize: false,
    // Remove webpack runtime from bundle
    runtimeChunk: 'single',
  },
  target: 'node',
};
