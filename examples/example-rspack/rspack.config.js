/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const path = require('path');
const rspack = require('@rspack/core');
const stylex = require('@stylexjs/unplugin').default;

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    app: path.resolve(__dirname, 'src/main.jsx'),
  },
  experiments: {
    // Disable built-in CSS experiment when using extract plugin
    css: false,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'ecmascript', jsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
      },
      {
        test: /\.css$/,
        use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    // Use the unplugin adapter for Rspack/webpack
    stylex.rspack({}),
    new rspack.CssExtractRspackPlugin({ filename: 'index.css' }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 5174,
  },
};
