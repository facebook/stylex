const path = require('path');
const babel = require('@babel/core');
const loaderUtils = require('loader-utils');
const babelPlugin = require('../babel/src');
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
      plugins: [[babelPlugin, {...options, stylexSheetName: 'index.css'}]],
      inputSourceMap: inputSourceMap || true,
      sourceFileName: this.resourcePath,
      filename: path.basename(this.resourcePath),
      sourceMaps: true,
      parserOpts: parserOptions
    });

    if (metadata.stylex === undefined || metadata.stylex.length === 0) {
      this.callback(null, input, inputSourceMap);
    } else if (!outputCSS) {
      this.callback(null, code, map);
    } else {
      // const cssPath = path.basename(this.resourcePath) + '.css'
      const cssPath = loaderUtils.interpolateName(
        this,
        '[path][name].[hash:base64:7].css',
        {
          content: `/*${JSON.stringify(metadata.stylex)}*/` // 
        }
      );
      virtualModules.writeModule(cssPath, `/*${JSON.stringify(metadata.stylex)}*/`); // 

      const extraImport = `\nimport '${inlineLoader + cssPath}';\n\n`;
      const newCode = extraImport + code;

      this.callback(null, newCode, map);
    }
  } catch (error) {
    this.callback(error);
  }
}

module.exports = styleXLoader;