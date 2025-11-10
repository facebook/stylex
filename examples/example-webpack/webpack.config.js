/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
const fs = require('node:fs');
const path = require('path');
const templatePath = path.resolve(__dirname, 'index.html');
const templateContent = () => fs.readFileSync(templatePath, 'utf-8');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const stylex = require('@stylexjs/unplugin').default;

const config = (env, argv) => {
  const isHot = argv.hot;
  return {
    entry: {
      main: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      path: path.resolve(__dirname, './dist'),
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      watchFiles: [templatePath, path.resolve(__dirname, 'src/**/*')],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                plugins: [
                  isHot && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.(css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['file-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['*', '.js', '.jsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        templateContent,
      }),
      stylex.webpack({
        useCSSLayers: true,
      }),
      new MiniCssExtractPlugin(),
      isHot && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    cache: true,
  };
};

module.exports = config;
