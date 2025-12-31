/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { transformAsync } = require('@babel/core');
const stylexBabelPlugin = require('@stylexjs/babel-plugin');
const flowSyntaxPlugin = require('@babel/plugin-syntax-flow').default;
const jsxSyntaxPlugin = require('@babel/plugin-syntax-jsx').default;
const typescriptSyntaxPlugin =
  require('@babel/plugin-syntax-typescript').default;
const path = require('node:path');
const fs = require('node:fs');
const { transform, browserslistToTargets } = require('lightningcss');
const browserslist = require('browserslist');
const crypto = require('crypto');

const IS_DEV_ENV =
  process.env.NODE_ENV === 'development' ||
  process.env.BABEL_ENV === 'development';

/**
 * Replaces [hash] placeholder in filename with actual content hash
 */
function replaceFileName(original, css) {
  if (!original.includes('[hash]')) {
    return original;
  }
  const hash = crypto
    .createHash('sha256')
    .update(css)
    .digest('hex')
    .slice(0, 8);
  return original.replace(/\[hash\]/g, hash);
}

/**
 * Creates a StyleX plugin for Bun's bundler
 * @param {Object} options - Plugin options
 * @param {boolean} [options.dev] - Whether to run in development mode
 * @param {Object} [options.unstable_moduleResolution] - Module resolution config
 * @param {string} [options.fileName] - Output CSS filename (supports [hash])
 * @param {Object} [options.babelConfig] - Additional Babel config
 * @param {Array} [options.importSources] - StyleX import sources to detect
 * @param {boolean} [options.useCSSLayers] - Whether to use CSS layers
 * @param {Object} [options.lightningcssOptions] - LightningCSS options
 * @returns {Object} Bun plugin object
 */
function stylexPlugin({
  dev = IS_DEV_ENV,
  unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
  fileName = 'stylex.css',
  babelConfig: { plugins = [], presets = [] } = {},
  importSources = ['stylex', '@stylexjs/stylex'],
  useCSSLayers = false,
  lightningcssOptions,
  ...options
} = {}) {
  let stylexRules = {};
  let outdir = './dist';

  return {
    name: 'bun-plugin-stylex',
    setup(build) {
      stylexRules = {};
      outdir = build.config?.outdir || './dist';

      build.onLoad(
        { filter: /\.[cm]?[jt]sx?$/ },
        async (args) => {
          const filePath = args.path;

          let inputCode;
          try {
            inputCode = fs.readFileSync(filePath, 'utf8');
          } catch {
            return;
          }

          const hasStylexImport = importSources.some((importName) =>
            typeof importName === 'string'
              ? inputCode.includes(importName)
              : inputCode.includes(importName.from),
          );

          if (!hasStylexImport) {
            return;
          }

          const result = await transformAsync(inputCode, {
            babelrc: false,
            filename: filePath,
            presets,
            plugins: [
              ...plugins,
              /\.jsx?$/.test(path.extname(filePath))
                ? flowSyntaxPlugin
                : [typescriptSyntaxPlugin, { isTSX: true }],
              jsxSyntaxPlugin,
              stylexBabelPlugin.withOptions({
                ...options,
                dev,
                unstable_moduleResolution,
              }),
            ],
            caller: {
              name: '@stylexjs/bun-plugin',
              supportsStaticESM: true,
              supportsDynamicImport: true,
              supportsTopLevelAwait: !inputCode.includes('require('),
              supportsExportNamespaceFrom: true,
            },
          });

          if (result == null || result.code == null) {
            return;
          }

          const { code, metadata } = result;

          if (
            !options.runtimeInjection &&
            metadata?.stylex != null &&
            metadata.stylex.length > 0
          ) {
            stylexRules[filePath] = metadata.stylex;
          }

          let loader = 'js';
          if (filePath.endsWith('.ts') || filePath.endsWith('.mts')) {
            loader = 'ts';
          } else if (filePath.endsWith('.tsx')) {
            loader = 'tsx';
          } else if (filePath.endsWith('.jsx')) {
            loader = 'jsx';
          }

          return {
            contents: code,
            loader,
          };
        },
      );

      // Use onEnd hook to write CSS after build completes
      build.onEnd((result) => {
        if (!result.success) {
          return;
        }

        const rules = Object.values(stylexRules).flat();
        if (rules.length === 0) {
          return;
        }

        const collectedCSS = stylexBabelPlugin.processStylexRules(rules, {
          useLayers: useCSSLayers,
          enableLTRRTLComments: options?.enableLTRRTLComments,
        });

        const { code } = transform({
          targets: browserslistToTargets(browserslist('>= 1%')),
          ...lightningcssOptions,
          filename: 'stylex.css',
          code: Buffer.from(collectedCSS),
        });

        const processedCSS = code.toString();

        // Find existing CSS file in outdir to append to
        let cssPath;
        try {
          const files = fs.readdirSync(outdir);
          const existingCssFile = files.find((f) => f.endsWith('.css'));
          if (existingCssFile) {
            cssPath = path.join(outdir, existingCssFile);
          }
        } catch {
          // Directory doesn't exist yet
        }

        // Fall back to creating new file
        if (!cssPath) {
          const finalFileName = replaceFileName(fileName, processedCSS);
          cssPath = path.join(outdir, finalFileName);
        }

        try {
          fs.mkdirSync(path.dirname(cssPath), { recursive: true });

          // Append to existing CSS file or create new one
          if (fs.existsSync(cssPath)) {
            const existingCSS = fs.readFileSync(cssPath, 'utf8');
            fs.writeFileSync(cssPath, existingCSS + '\n' + processedCSS, 'utf8');
          } else {
            fs.writeFileSync(cssPath, processedCSS, 'utf8');
          }
        } catch (e) {
          console.error('[stylex] Failed to write CSS file:', e);
        }
      });
    },
  };
}

module.exports = stylexPlugin;
module.exports.default = stylexPlugin;
