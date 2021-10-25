const path = require('path');
const stylexBabelPlugin = require('babel-plugin-transform-stylex');
const StylexPlugin = require('webpack-plugin-stylex');

module.exports = env => ({
  entry: './index.js',
  output: {
    filename: 'main.js',
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [stylexBabelPlugin, { dev: env.prod !== true }]
            ],
            metadataSubscribers: [StylexPlugin.stylexMetadataSubscription],
          }
        }
      },
    ],
  },
  plugins: [
    new StylexPlugin({
      filename: 'atomic.css',
    }),
  ],
  /**
   * By default, Webpack converts every module into a string that
   * is `eval`ed at runtime. This makes it every hard to inspect
   * the generated code for correctness.
   *
   * The option of `cheap-source-map` gives you somethings easier
   */
  devtool: 'cheap-source-map',
});
