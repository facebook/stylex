/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const postcss = require('postcss');
const createPlugin = require('../src/plugin');

describe('@stylexjs/postcss-plugin', () => {
  const fixturesDir = path.resolve(__dirname, '__fixtures__');

  async function runStylexPostcss(options = {}, inputCSS = '@stylex;') {
    // Create a new instance for each test as the plugin is stateful
    const stylexPostcssPlugin = createPlugin();

    const plugin = stylexPostcssPlugin({
      cwd: fixturesDir,
      include: ['**/*.js'],
      babelConfig: {
        configFile: path.join(fixturesDir, '.babelrc.json'),
      },
      ...options,
    });

    const processor = postcss([plugin]);
    const result = await processor.process(inputCSS, {
      from: path.join(fixturesDir, 'input.css'),
    });

    return result;
  }

  it('extracts CSS from StyleX files', async () => {
    const result = await runStylexPostcss();

    expect(result.css).toMatchInlineSnapshot(`
      ".x1u857p9{background-color:green}
      .xrkmrrc{background-color:red}"
    `);

    // Check that messages contain dependency information
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.some((m) => m.type === 'dir-dependency')).toBe(true);
  });

  it('handles empty CSS input without @stylex rule', async () => {
    const result = await runStylexPostcss({}, '/* No stylex rule here */');

    expect(result.css).toMatchInlineSnapshot('"/* No stylex rule here */"');
    expect(result.messages.length).toBe(0);
  });

  it('supports CSS layers', async () => {
    const result = await runStylexPostcss({ useCSSLayers: true });

    expect(result.css).toContain('@layer');
    expect(result.css).toMatchInlineSnapshot(`
      "
      @layer priority1;
      @layer priority1{
      .x1u857p9{background-color:green}
      .xrkmrrc{background-color:red}
      }"
    `);
  });

  it('handles exclude patterns', async () => {
    const result = await runStylexPostcss({
      exclude: ['**/styles-second.js'],
    });

    // Should not contain styles-second.js styles
    expect(result.css).not.toContain('green');

    expect(result.css).toMatchInlineSnapshot(
      '".xrkmrrc{background-color:red}"',
    );
  });

  it('respects string syntax for importSources', async () => {
    // Default importSources should not process any files
    const defaultResult = await runStylexPostcss({
      include: ['**/import-sources-*.js'],
    });

    expect(defaultResult.css).toBe('');

    // Custom importSources should process only import-sources-string.js
    const customResult = await runStylexPostcss({
      include: ['**/import-sources-*.js'],
      importSources: ['custom'],
      babelConfig: {
        babelrc: false,
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: false,
              runtimeInjection: false,
              importSources: ['custom'],
            },
          ],
        ],
      },
    });

    expect(customResult.css).toMatchInlineSnapshot(
      '".x1t391ir{background-color:blue}"',
    );
  });

  it('supports object syntax for importSources', async () => {
    const result = await runStylexPostcss({
      include: ['**/import-sources-object.js'],
      importSources: [{ as: 'css', from: 'react-strict-dom' }],
      babelConfig: {
        babelrc: false,
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        plugins: [
          [
            '@stylexjs/babel-plugin',
            {
              dev: false,
              runtimeInjection: false,
              importSources: [{ as: 'css', from: 'react-strict-dom' }],
            },
          ],
        ],
      },
    });

    expect(result.css).toMatchInlineSnapshot(
      '".x1cu41gw{background-color:yellow}"',
    );
  });

  it('skips files that do not match include/exclude patterns', async () => {
    const result = await runStylexPostcss({
      include: ['**/styles-second.js'],
    });

    // Should contain styles-second.js styles but not styles.js
    expect(result.css).not.toContain('red');

    expect(result.css).toMatchInlineSnapshot(
      '".x1u857p9{background-color:green}"',
    );
  });
});
