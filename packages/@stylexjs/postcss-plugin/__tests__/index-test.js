/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('path');
const postcss = require('postcss');
const createPlugin = require('../src/plugin');

describe('@stylexjs/postcss-plugin', () => {
  const fixturesDir = path.resolve(__dirname, '__fixtures__');
  const autoDiscoveryFixturesDir = path.resolve(
    __dirname,
    '__auto_discovery_fixtures__',
  );

  function createAutoDiscoveryFixture() {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-postcss-auto-discovery-'),
    );

    fs.cpSync(autoDiscoveryFixturesDir, tempDir, { recursive: true });

    const stylexBabelPluginDir = path.join(
      tempDir,
      'node_modules',
      '@stylexjs',
      'babel-plugin',
    );
    fs.mkdirSync(stylexBabelPluginDir, { recursive: true });
    fs.writeFileSync(
      path.join(stylexBabelPluginDir, 'package.json'),
      JSON.stringify(
        {
          name: '@stylexjs/babel-plugin',
          version: '0.0.0-test',
          main: 'index.js',
        },
        null,
        2,
      ),
      'utf8',
    );
    fs.writeFileSync(
      path.join(stylexBabelPluginDir, 'index.js'),
      `module.exports = require(${JSON.stringify(
        path.resolve(__dirname, '..', '..', 'babel-plugin', 'lib', 'index.js'),
      )});\n`,
      'utf8',
    );

    const stylexLibDir = path.join(
      tempDir,
      'node_modules',
      'stylex-custom-lib',
    );
    fs.mkdirSync(stylexLibDir, { recursive: true });
    fs.writeFileSync(
      path.join(stylexLibDir, 'package.json'),
      JSON.stringify(
        {
          name: 'stylex-custom-lib',
          version: '1.0.0',
          main: 'index.js',
          dependencies: {
            'react-strict-dom': '^0.0.0',
          },
        },
        null,
        2,
      ),
      'utf8',
    );
    fs.writeFileSync(
      path.join(stylexLibDir, 'index.js'),
      [
        "import { css } from 'react-strict-dom';",
        '',
        'export const styles = css.create({',
        '  lib: {',
        "    backgroundColor: 'orange',",
        '  },',
        '});',
        '',
      ].join('\n'),
      'utf8',
    );

    const nonStylexLibDir = path.join(
      tempDir,
      'node_modules',
      'non-stylex-lib',
    );
    fs.mkdirSync(nonStylexLibDir, { recursive: true });
    fs.writeFileSync(
      path.join(nonStylexLibDir, 'package.json'),
      JSON.stringify(
        {
          name: 'non-stylex-lib',
          version: '1.0.0',
          main: 'index.js',
        },
        null,
        2,
      ),
      'utf8',
    );
    fs.writeFileSync(
      path.join(nonStylexLibDir, 'index.js'),
      'export const v = 1;\n',
    );

    return tempDir;
  }

  async function runStylexPostcss(options = {}, inputCSS = '@stylex;') {
    // Create a new instance for each test as the plugin is stateful
    const stylexPostcssPlugin = createPlugin();

    const plugin = stylexPostcssPlugin({
      cwd: fixturesDir,
      include: ['**/*.js'],
      babelConfig: {
        configFile: path.join(fixturesDir, '.babelrc.js'),
      },
      ...options,
    });

    const processor = postcss([plugin]);
    const result = await processor.process(inputCSS, {
      from: path.join(fixturesDir, 'input.css'),
    });

    return result;
  }

  async function runAutoDiscoveryPostcss(options = {}, inputCSS = '@stylex;') {
    const fixtureDir = createAutoDiscoveryFixture();
    const stylexPostcssPlugin = createPlugin();
    const { useResolvedBabelConfig = false, ...pluginOptions } = options;

    const basePluginOptions = {
      cwd: fixtureDir,
    };

    if (!useResolvedBabelConfig) {
      const babelConfig = require(path.join(fixtureDir, 'babel.config.js'));
      basePluginOptions.babelConfig = {
        babelrc: false,
        plugins: babelConfig.plugins,
      };
    }

    const plugin = stylexPostcssPlugin({
      ...basePluginOptions,
      ...pluginOptions,
    });

    const processor = postcss([plugin]);
    try {
      const result = await processor.process(inputCSS, {
        from: path.join(fixtureDir, 'input.css'),
      });
      return {
        css: result.css,
        messages: result.messages,
      };
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  }

  test('extracts CSS from StyleX files', async () => {
    const result = await runStylexPostcss();

    expect(result.css).toMatchInlineSnapshot(`
      ".x1u857p9{background-color:green}
      .xrkmrrc{background-color:red}"
    `);

    // Check that messages contain dependency information
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.some((m) => m.type === 'dir-dependency')).toBe(true);
  });

  test('handles empty CSS input without @stylex rule', async () => {
    const result = await runStylexPostcss({}, '/* No stylex rule here */');

    expect(result.css).toMatchInlineSnapshot('"/* No stylex rule here */"');
    expect(result.messages.length).toBe(0);
  });

  test('supports CSS layers', async () => {
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

  test('handles exclude patterns', async () => {
    const result = await runStylexPostcss({
      exclude: ['**/styles-second.js'],
    });

    // Should not contain styles-second.js styles
    expect(result.css).not.toContain('green');

    expect(result.css).toMatchInlineSnapshot(
      '".xrkmrrc{background-color:red}"',
    );
  });

  test('respects string syntax for importSources', async () => {
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

  test('supports object syntax for importSources', async () => {
    const result = await runStylexPostcss({
      include: ['**/import-sources-object.js'],
      importSources: [{ as: 'css', from: 'react-strict-dom' }],
      babelConfig: {
        babelrc: false,
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

  test('skips files that do not match include/exclude patterns', async () => {
    const result = await runStylexPostcss({
      include: ['**/styles-second.js'],
    });

    // Should contain styles-second.js styles but not styles.js
    expect(result.css).not.toContain('red');

    expect(result.css).toMatchInlineSnapshot(
      '".x1u857p9{background-color:green}"',
    );
  });

  test('auto-discovers include globs when include is omitted', async () => {
    const result = await runStylexPostcss({
      include: undefined,
    });

    expect(result.css).toContain('background-color:green');
    expect(result.css).toContain('background-color:red');
  });

  test('auto-discovers StyleX dependency directories and importSources from Babel config', async () => {
    const result = await runAutoDiscoveryPostcss();

    expect(result.css).toContain('color:red');
    expect(result.css).toContain('color:purple');
    expect(result.css).toContain('background-color:orange');

    expect(
      result.messages.some(
        (message) =>
          message.type === 'dir-dependency' &&
          message.dir.includes('stylex-custom-lib'),
      ),
    ).toBe(true);
  });

  test('does not auto-discover dependency directories when include is explicitly provided', async () => {
    const result = await runAutoDiscoveryPostcss({
      include: ['src/local-stylex.js'],
    });

    expect(result.css).toContain('color:red');
    expect(result.css).not.toContain('background-color:orange');
    expect(
      result.messages.some(
        (message) =>
          message.type === 'dir-dependency' &&
          message.dir.includes('stylex-custom-lib'),
      ),
    ).toBe(false);
  });

  test('infers importSources from resolved babel config when plugins are not passed inline', async () => {
    const previousCwd = process.cwd();
    process.chdir(os.tmpdir());

    try {
      const result = await runAutoDiscoveryPostcss({
        useResolvedBabelConfig: true,
      });

      expect(result.css).toContain('color:red');
      expect(result.css).toContain('color:purple');
      expect(result.css).toContain('background-color:orange');
    } finally {
      process.chdir(previousCwd);
    }
  });

  test('prefers explicit importSources over inferred babel importSources', async () => {
    const result = await runAutoDiscoveryPostcss({
      useResolvedBabelConfig: true,
      importSources: ['@stylexjs/stylex'],
    });

    expect(result.css).toContain('color:red');
    expect(result.css).not.toContain('color:purple');
    expect(result.css).not.toContain('background-color:orange');
  });
});
