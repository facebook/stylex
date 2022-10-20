/**
 * Copyright (c) Johan Holmerin.
 * The MIT License (MIT)
 * https://github.com/johanholmerin/style9/blob/master/next.js
 */

/*
const {
  getClientStyleLoader,
} = require('next/dist/build/webpack/config/blocks/css/loaders/client');
const cssLoader = require('next/dist/compiled/css-loader');
*/
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackPluginStylex = require('@stylexjs/webpack-plugin');

/*
function stringifyLoaderRequest({ loader, options = {} }) {
  return `${loader}?${JSON.stringify(options)}`;
}

function stringifyCssRequest(outputLoaders) {
  const cssLoaders = outputLoaders.map(stringifyLoaderRequest).join('!');

  return `!${cssLoaders}!`;
}

function getInlineLoader(options, MiniCssExtractPlugin) {
  const outputLoaders = [{ loader: cssLoader }];

  if (!options.isServer) {
    outputLoaders.unshift({
      // Logic adopted from https://git.io/JfD9r
      ...getClientStyleLoader({
        // In development model Next.js uses style-loader, which inserts each
        // CSS file as its own style tag, which means the CSS won't be sorted
        // and causes issues with determinism when using media queries and
        // pseudo selectors. Setting isDevelopment means MiniCssExtractPlugin is
        // used instead.
        isDevelopment: false,
        assetPrefix: options.config.assetPrefix,
      }),
      loader: MiniCssExtractPlugin.loader,
    });
  }

  return stringifyCssRequest(outputLoaders);
}
*/

module.exports =
  (pluginOptions = {}) =>
  (nextConfig = {}) => {
    return {
      ...nextConfig,
      webpack(config, options) {
        const outputCSS = !options.isServer;

        // The stylex compiler must run on source code, which means it must be
        // configured as the last loader in webpack so that it runs before any
        // other transformation.

        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, options);
        }

        // For some reason, Next 11.0.1 has `config.optimization.splitChunks`
        // set to `false` when webpack 5 is enabled.
        config.optimization.splitChunks = config.optimization.splitChunks || {
          cacheGroups: {},
        };

        /*
      // TODO: WebpackPluginStylex.loader is undefined
      config.module.rules.push({
        test: /\.(tsx|ts|js|mjs|jsx)$/,
        use: [
          {
            loader: WebpackPluginStylex.loader,
            options: {
              inlineLoader: getInlineLoader(options, MiniCssExtractPlugin),
              outputCSS,
              ...pluginOptions
            }
          }
        ]
      });
      */

        if (outputCSS) {
          config.optimization.splitChunks.cacheGroups.styles = {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          };

          // HMR reloads the CSS file when the content changes but does not use
          // the new file name, which means it can't contain a hash.
          const filename = options.dev
            ? 'static/css/[name].css'
            : 'static/css/[contenthash].css';

          config.plugins.push(
            // Logic adopted from https://git.io/JtdBy
            new MiniCssExtractPlugin({
              filename,
              chunkFilename: filename,
              ignoreOrder: true,
            }),
            new WebpackPluginStylex()
          );
        }

        return config;
      },
    };
  };
