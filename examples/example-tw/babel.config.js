/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');

// Synchronous wrapper for tailwind-to-stylex
const tailwindToStylexSync = require('./tailwind-to-stylex-sync');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  presets: ['next/babel'],
  plugins: [
    // tailwind-to-stylex runs FIRST to transform className to StyleX
    tailwindToStylexSync,
    // StyleX babel plugin runs SECOND to compile StyleX
    [
      '@stylexjs/babel-plugin',
      // See all options in the babel plugin configuration docs:
      // https://stylexjs.com/docs/api/configuration/babel-plugin/
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: {
          '@/*': [path.join(__dirname, '*')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
        },
      },
    ],
  ],
};
