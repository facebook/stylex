const path = require('path');
const babel = require('@babel/core');
const loaderUtils = require('loader-utils');
const babelPlugin = require('../babel/src');
const virtualModules = require('./virtualModules.js');

async function styleXLoader(input, inputSourceMap) {
  // The use of this loader shouldn't need to provide
  // any configuration options.
  // Using the file extension we can automatically choose
  // between `typescript` or `flow` syntax extensions.
  const isTypeScript = this.resourcePath.endsWith('.ts') || this.resourcePath.endsWith('.tsx');
  const fileType =
    isTypeScript
      ? 'typescript'
      : ['flow', { enums: true }];

  // These are the default options.
  // You can override them all.
  const {
    inlineLoader = '',
    outputCSS = true,
    parserOptions = {
      plugins: [
        fileType,
        'jsx',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
      ],
    },
    virtualCSSName = '[path][name].[hash:base64:7].css',
    ...options
  } = loaderUtils.getOptions(this) || {};

  this.async();
  
  try {
    const transformPresets = isTypeScript ? ['@babel/preset-typescript'] : ['@babel/preset-flow'];
    const { code, map, metadata } = await babel.transformAsync(input, {
      presets: transformPresets,
      plugins: [
        [
          babelPlugin,
          { dev: !outputCSS, ...options, stylexSheetName: 'index.css' },
        ],
      ],
      inputSourceMap: inputSourceMap || true,
      sourceFileName: this.resourcePath,
      filename: path.basename(this.resourcePath),
      sourceMaps: true,
      parserOpts: parserOptions,
    });

    if (metadata.stylex === undefined || metadata.stylex.length === 0) {
      this.callback(null, input, inputSourceMap);
    } else if (!outputCSS) {
      this.callback(null, code, map);
    } else {
      const cssPath = loaderUtils.interpolateName(this, virtualCSSName, {
        content: `/*${JSON.stringify(metadata.stylex)}*/`, //
      });
      virtualModules.writeModule(
        cssPath,
        `/*${JSON.stringify(metadata.stylex)}*/`,
      ); //

      const extraImport = `\nimport '${inlineLoader + cssPath}';\n\n`;
      const newCode = extraImport + code;

      this.callback(null, newCode, map);
    }
  } catch (error) {
    this.callback(error);
  }
}

module.exports = styleXLoader;
