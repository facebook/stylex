const path = require('path');
const StylexPlugin = require('../../src/index');

const stylexPlugin = new StylexPlugin();

module.exports = {
  context: __dirname,
  entry: path.resolve(__dirname, './index.js'),
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
  plugins: [stylexPlugin],
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
