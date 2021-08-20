const EntryPlugin = require('webpack/lib/EntryPlugin');
const { RawSource } = require('webpack-sources');
const stylexBabelPlugin = require('../babel/src');

const PLUGIN_NAME = 'stylex';

class StylexPlugin {
  static stylexMetadataSubscription = 'stylexMetadata';
  constructor({ filename = 'stylex.css' } = {}) {
    this.filename = filename;
  }

  apply(compiler) {
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    let stylexRules = [];

    // Read stylex metadata from individual modules and collect it
    compiler.hooks.make.tap(PLUGIN_NAME, compilation => {
      compiler.webpack.NormalModule.getCompilationHooks(compilation).loader.tap(
        PLUGIN_NAME,
        function (context, module) {
          const resourceName = module.resource;
          context[StylexPlugin.stylexMetadataSubscription] = function (
            metadata,
          ) {
            if (metadata.stylex != null && metadata.stylex.length > 0) {
              stylexRules = stylexRules.concat(metadata.stylex);
              logger.debug(
                `Read stylex from ${resourceName}:`,
                metadata.stylex,
              );
            }
          };
        },
      );

      // Consumer collected rules and emit the stylex CSS asset
      compilation.hooks.additionalAssets.tap(PLUGIN_NAME, () => {
        try {
          const collectedCSS = stylexBabelPlugin.processStylexRules(stylexRules);
          compilation.emitAsset(this.filename, new RawSource(collectedCSS));
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    });
  }
}

module.exports = StylexPlugin;
