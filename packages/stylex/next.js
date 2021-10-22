// license by johanholmerin


const {
  getClientStyleLoader
} = require('next/dist/build/webpack/config/blocks/css/loaders/client');
const { stringifyCssRequest } = require('./lib/plugin-utils.js');
const StylexPlugin = require('./webpack.js');

const cssLoader = (() => {
  try {
    // v10+
    return require.resolve('next/dist/compiled/css-loader');
  } catch (_) {
    return 'css-loader';
  }
})();

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
        assetPrefix: options.config.assetPrefix
      }),
      loader: MiniCssExtractPlugin.loader
    });
  }

  return stringifyCssRequest(outputLoaders);
}

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
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
        cacheGroups: {}
      };

      // Use own MiniCssExtractPlugin to ensure HMR works
      // v9 has issues when using own plugin in production
      // v10.2.1 has issues when using built-in plugin in development since it
      // doesn't bundle HMR files
      const MiniCssExtractPlugin = options.dev
        ? require('mini-css-extract-plugin')
        : require('next/dist/build/webpack/plugins/mini-css-extract-plugin')
            .default;

      config.module.rules.push({
        test: /\.(tsx|ts|js|mjs|jsx)$/,
        use: [
          {
            loader: StylexPlugin.loader,
            options: {
              inlineLoader: getInlineLoader(options, MiniCssExtractPlugin),
              outputCSS,
              ...pluginOptions
            }
          }
        ]
      });

      if (outputCSS) {
        config.optimization.splitChunks.cacheGroups.styles = {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
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
            ignoreOrder: true
          }),
          new StylexPlugin()
        );
      }

      return config;
    }
  };
};
