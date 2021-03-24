const { SourceMapSource, RawSource } = require('webpack-sources');
const NAME = require('../package.json').name;
// const processCSS = require('../src/process-css.js');
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
          const asset = compilation.assets[path];
          const { source, map } = asset.sourceAndMap();
          const postcssOpts = {
            to: path,
            from: path,
            map: { prev: map || false }
          };

          const sortedRules = source
            .trim()
            .split('\n')
            .map(line => line.slice(2, -2))
            .filter(Boolean)
            .flatMap(json => JSON.parse(json))
            .sort(([,,first], [,,second]) => first - second)
          
          const finalCSS = Array.from(new Map(sortedRules).values()).flatMap(({ltr, rtl}) =>
            rtl != null 
            ? [`html:not([dir='rtl']) ${ltr}`, `html[dir='rtl'] ${rtl}`]
            : [ltr]
          ).join('\n');
          
          console.log('FINAL CSS:', finalCSS)

          compilation.assets[path] = new RawSource(finalCSS);
          
        }
      });
    });
  }
}

module.exports = StyleXPlugin;

module.exports.loader = require.resolve('./loader.js');