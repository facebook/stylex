const { SourceMapSource, RawSource } = require('webpack-sources');
const NAME = require('../package.json').name;
const virtualModules = require('./virtualModules.js');

class StyleXPlugin {
  constructor({ test = /\.css$/ } = {}) {
    this.test = test;
  }

  apply(compiler) {
    virtualModules.apply(compiler);

    compiler.hooks.compilation.tap(NAME, compilation => {
      compilation.hooks.optimizeChunkAssets.tapPromise(NAME, async chunks => {
        const paths = Array.from(chunks)
          .flatMap(chunk => Array.from(chunk.files))
          .filter(path => path.match(this.test));

        for (const path of paths) {
          try {
            const asset = compilation.assets[path];
            const { source, map } = asset.sourceAndMap();
            const postcssOpts = {
              to: path,
              from: path,
              map: { prev: map || false }
            };

            const rules = source
              .trim()
              .split('\n')
              .filter(line => line.startsWith('/*[') && line.endsWith(']*/'))
              .map(line => line.slice(2, -2))
              .filter(Boolean)
            
            // If this CSS file doesn't have any rules from Stylex,
            // Continue onto the next one.
            if (rules.length === 0) {
              continue;
            }
            
            const sortedRules = rules
              .flatMap(json => JSON.parse(json))
              .sort(([,,first], [,,second]) => first - second)
            
            const otherStyles = source
              .trim()
              .split('\n')
              .filter(line => !line.startsWith('/*[') || !line.endsWith(']*/'))
              .join('\n')
            
            const finalCSS = Array.from(new Map(sortedRules).values()).flatMap(({ltr, rtl}) =>
              rtl != null 
              ? [`html:not([dir='rtl']) ${ltr}`, `html[dir='rtl'] ${rtl}`]
              : [ltr]
            ).join('\n');

            // Here the styles from Stylex come before the other styles
            //
            // TODO: there should be an option to flip this order so that
            // stylex can take precendence over other CSS.
            const combinedCSS = [finalCSS, otherStyles].join('\n');

            compilation.assets[path] = new RawSource(finalCSS);
          } catch(e) {
            console.error('StyleX Webpack Plugin Error:', e.message);
          }
        }
      });
    });
  }
}

module.exports = StyleXPlugin;

module.exports.loader = require.resolve('./loader.js');