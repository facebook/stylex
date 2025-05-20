/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const postcss = require('postcss');
const createBuilder = require('./builder');
const cascadeLayers = require('@csstools/postcss-cascade-layers');

const PLUGIN_NAME = '@stylexjs/postcss-plugin';

const VALID_CSS_LAYERS = ['none', 'native', 'polyfill'];

const builder = createBuilder();

const isDev = process.env.NODE_ENV === 'development';

const plugin = ({
  cwd = process.cwd(),
  // By default reuses the Babel configuration from the project root.
  // Use `babelrc: false` to disable this behavior.
  babelConfig = {},
  include,
  exclude,
  useCSSLayers = 'none',
}) => {
  if (!VALID_CSS_LAYERS.includes(useCSSLayers)) {
    throw new Error(
      `Invalid useCSSLayers value: "${useCSSLayers}". ` +
        `Valid values are: ${VALID_CSS_LAYERS.join(', ')}`,
    );
  }

  exclude = [
    // Exclude type declaration files by default because it never contains any CSS rules.
    '**/*.d.ts',
    '**/*.flow',
    ...(exclude ?? []),
  ];

  // Whether to skip the error when transforming StyleX rules.
  // Useful in watch mode where Fast Refresh can recover from errors.
  // Initial transform will still throw errors in watch mode to surface issues early.
  let shouldSkipTransformError = false;

  return {
    postcssPlugin: PLUGIN_NAME,
    plugins: [
      // Processes the PostCSS root node to find and transform StyleX at-rules.
      async function (root, result) {
        const fileName = result.opts.from;

        // Configure the builder with the provided options
        await builder.configure({
          include,
          exclude,
          cwd,
          babelConfig,
          useCSSLayers,
          isDev,
        });
        // Find the "@stylex" at-rule
        const styleXAtRule = builder.findStyleXAtRule(root);
        if (styleXAtRule == null) {
          return;
        }

        // Get dependencies to be watched for changes
        const dependencies = builder.getDependencies();

        // Add each dependency to the PostCSS result messages.
        // This watches the entire "./src" directory for "./src/**/*.{ts,tsx}"
        // to handle new files and deletions reliably in watch mode.
        for (const dependency of dependencies) {
          result.messages.push({
            plugin: PLUGIN_NAME,
            parent: fileName,
            ...dependency,
          });
        }

        // Build and parse the CSS from collected StyleX rules
        const css = await builder.build({
          shouldSkipTransformError,
        });

        let processedCss = css;
        if (useCSSLayers === 'polyfill') {
          const result = await postcss([
            cascadeLayers({
              onRevertLayerKeyword: 'warn',
              onConditionalRulesChangingLayerOrder: 'warn',
              onImportLayerRule: 'warn',
            }),
          ]).process(css);
          processedCss = result.css;
        }

        const parsed = await postcss.parse(processedCss, {
          from: fileName,
        });

        // Replace the "@stylex" rule with the generated CSS
        styleXAtRule.replaceWith(parsed);

        result.root = root;

        if (!shouldSkipTransformError) {
          // Build was successful, subsequent builds are for watch mode
          shouldSkipTransformError = true;
        }
      },
    ],
  };
};
// console.log('plugin', plugin);
plugin.postcss = true;

module.exports = plugin;
