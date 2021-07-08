const path = require('path');
const StyleXPlugin = require('stylex/webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'main.js',
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: StyleXPlugin.loader,
        // Example of how to pass options to the loader
        options: {outputCSS: true}
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      }
    ]
  },
  plugins: [
    new StyleXPlugin(),
    new MiniCssExtractPlugin({
      filename: 'index.css'
    })
  ],
  /**
   * By default, Webpack converts every module into a string that
   * is `eval`ed at runtime. This makes it every hard to inspect
   * the generated code for correctness.
   * 
   * The option of `cheap-source-map` gives you somethings easier
   */
  devtool: 'cheap-source-map'
};