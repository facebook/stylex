const path = require('path');
const babel = require('@babel/core');
const loaderUtils = require('loader-utils');
const babelPlugin = require('../babel.js');
const virtualModules = require('./virtualModules.js');

async function styleXLoader(input, inputSourceMap) {
  const {
    inlineLoader = '',
    outputCSS = true,
    parserOptions = {
      plugins: ['typescript', 'jsx']
    },
    ...options
  } = loaderUtils.getOptions(this) || {};

  this.async();

  try {
    const { code, map, metadata } = await babel.transformAsync(input, {
      plugins: [[babelPlugin, options]],
      inputSourceMap: inputSourceMap || true,
      sourceFileName: this.resourcePath,
      filename: path.basename(this.resourcePath),
      sourceMaps: true,
      parserOpts: parserOptions
    });

    if (metadata.style9 === undefined) {
      this.callback(null, input, inputSourceMap);
    } else if (!outputCSS) {
      this.callback(null, code, map);
    } else {
      const cssPath = loaderUtils.interpolateName(
        this,
        '[path][name].[hash:base64:7].css',
        {
          content: metadata.style9
        }
      );

      virtualModules.writeModule(cssPath, metadata.style9);

      const postfix = `\nimport '${inlineLoader + cssPath}';`;
      this.callback(null, code + postfix, map);
    }
  } catch (error) {
    this.callback(error);
  }
}

module.exports = styleXLoader;