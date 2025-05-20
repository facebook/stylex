/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

jest.autoMockOff();

const path = require('path');
const postcss = require('postcss');
const stylexPlugin = require('../src/index');

describe('@stylexjs/postcss-plugin', () => {
  test('should transform @stylex at-rule and apply cascadeLayers polyfill', async () => {
    const inputCss = `
      @stylex;
    `;

    const pluginOptions = {
      cwd: path.resolve(__dirname, '__fixtures__'),
      include: ['constants.stylex.js'],
      useCSSLayers: 'polyfill',
      babelConfig: {
        presets: ['@babel/preset-env'],
        plugins: ['@stylexjs/babel-plugin'],
      },
    };

    const result = await postcss([stylexPlugin(pluginOptions)]).process(
      inputCss,
      { from: undefined },
    );

    expect(result.css).toMatchInlineSnapshot(`
      "
      .xou54vl{gap:16px}
      .x6s0dn4:not(#\\#){align-items:center}
      .x78zum5:not(#\\#){display:flex}
      .xdt5ytf:not(#\\#){flex-direction:column}
      .x1q0g3np:not(#\\#){flex-direction:row}
      .x1ey7xld:not(#\\#){font-family:monospace}
      .x6icuqf:not(#\\#){font-family:sans-serif}
      .x1pvqxga:not(#\\#){font-size:24px}
      .xo1l8bm:not(#\\#){font-weight:400}
      .x1xlr1w8:not(#\\#){font-weight:700}
      .x1qughib:not(#\\#){justify-content:space-between}
      .xo5v014:not(#\\#){line-height:1}
      .x2b8uid:not(#\\#){text-align:center}
      .xuxw1ft:not(#\\#){white-space:nowrap}
      .xg6iff7:not(#\\#):not(#\\#){min-height:100vh}
      .x1gan7if:not(#\\#):not(#\\#){padding-bottom:32px}
      .x1miatn0:not(#\\#):not(#\\#){padding-top:32px}
          "
    `);
  });
  test('should handle useCSSLayers: none', async () => {
    const inputCss = `
      @stylex;
    `;

    const pluginOptions = {
      cwd: path.resolve(__dirname, '__fixtures__'),
      include: ['constants.stylex.js'],
      useCSSLayers: 'none',
      babelConfig: {
        presets: ['@babel/preset-env'],
        plugins: ['@stylexjs/babel-plugin'],
      },
    };

    const result = await postcss([stylexPlugin(pluginOptions)]).process(
      inputCss,
      { from: undefined },
    );

    expect(result.css).toMatchInlineSnapshot(`
      ".xou54vl{gap:16px}
      .x6s0dn4{align-items:center}
      .x78zum5{display:flex}
      .xdt5ytf{flex-direction:column}
      .x1q0g3np{flex-direction:row}
      .x1ey7xld{font-family:monospace}
      .x6icuqf{font-family:sans-serif}
      .x1pvqxga{font-size:24px}
      .xo1l8bm{font-weight:400}
      .x1xlr1w8{font-weight:700}
      .x1qughib{justify-content:space-between}
      .xo5v014{line-height:1}
      .x2b8uid{text-align:center}
      .xuxw1ft{white-space:nowrap}
      .xg6iff7{min-height:100vh}
      .x1gan7if{padding-bottom:32px}
      .x1miatn0{padding-top:32px}
          "
    `);
  });
  test('should handle useCSSLayers: none', async () => {
    const inputCss = `
      @stylex;
    `;

    const pluginOptions = {
      cwd: path.resolve(__dirname, '__fixtures__'),
      include: ['constants.stylex.js'],
      useCSSLayers: 'native',
      babelConfig: {
        presets: ['@babel/preset-env'],
        plugins: ['@stylexjs/babel-plugin'],
      },
    };

    const result = await postcss([stylexPlugin(pluginOptions)]).process(
      inputCss,
      { from: undefined },
    );

    expect(result.css).toMatchInlineSnapshot(`
      "
      @layer priority1, priority2, priority3;
      @layer priority1{
      .xou54vl{gap:16px}
      }
      @layer priority2{
      .x6s0dn4{align-items:center}
      .x78zum5{display:flex}
      .xdt5ytf{flex-direction:column}
      .x1q0g3np{flex-direction:row}
      .x1ey7xld{font-family:monospace}
      .x6icuqf{font-family:sans-serif}
      .x1pvqxga{font-size:24px}
      .xo1l8bm{font-weight:400}
      .x1xlr1w8{font-weight:700}
      .x1qughib{justify-content:space-between}
      .xo5v014{line-height:1}
      .x2b8uid{text-align:center}
      .xuxw1ft{white-space:nowrap}
      }
      @layer priority3{
      .xg6iff7{min-height:100vh}
      .x1gan7if{padding-bottom:32px}
      .x1miatn0{padding-top:32px}
      }
          "
    `);
  });
});
