/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { unplugin } = require('../src');

describe('@stylexjs/unplugin', () => {
  test('ignores files without StyleX imports', async () => {
    const plugin = unplugin.raw({});
    if (typeof plugin.buildStart === 'function') {
      plugin.buildStart();
    }
    const result = await plugin.transform('const noop = 1;', '/virtual/foo.js');
    expect(result).toBeNull();
  });

  test('writes fallback CSS asset when no CSS bundle entry exists', async () => {
    const plugin = unplugin.raw({
      runtimeInjection: false,
      devPersistToDisk: false,
      dev: false,
    });
    if (typeof plugin.buildStart === 'function') {
      plugin.buildStart();
    }
    const source = `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({ foo: { color: 'red' } });
      export default styles;
    `;
    const result = await plugin.transform(source, '/virtual/example.js');
    expect(result).not.toBeNull();

    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-unplugin-test-'),
    );
    try {
      await plugin.writeBundle({ dir: tempDir }, {});
      const cssPath = path.join(tempDir, 'assets', 'stylex.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      expect(cssContent).toContain('color: red;');
      expect(cssContent.trim()).toMatch(
        /^\.[a-z0-9]+ \{\n {2}color: red;\n\}$/i,
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('marks StyleX deps as non-optimized in Vite', async () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-unplugin-vite-'),
    );
    const originalCwd = process.cwd();
    try {
      const pkgJson = {
        dependencies: {
          'lib-using-stylex': '1.0.0',
          'lib-no-stylex': '1.0.0',
        },
      };
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify(pkgJson),
        'utf8',
      );
      fs.mkdirSync(path.join(tempDir, 'node_modules', 'lib-using-stylex'), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(tempDir, 'node_modules', 'lib-using-stylex', 'package.json'),
        JSON.stringify({
          name: 'lib-using-stylex',
          version: '1.0.0',
          dependencies: { '@stylexjs/stylex': '^0.0.0' },
        }),
        'utf8',
      );
      fs.mkdirSync(path.join(tempDir, 'node_modules', 'lib-no-stylex'), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(tempDir, 'node_modules', 'lib-no-stylex', 'package.json'),
        JSON.stringify({
          name: 'lib-no-stylex',
          version: '1.0.0',
        }),
        'utf8',
      );
      process.chdir(tempDir);

      const nestedDir = path.join(tempDir, 'nested', 'deeper');
      fs.mkdirSync(nestedDir, { recursive: true });
      process.chdir(nestedDir);

      const plugin = unplugin.vite({});
      const viteConfigHook = plugin.config;
      const result =
        typeof viteConfigHook === 'function'
          ? await viteConfigHook.call(
              plugin,
              {},
              { command: 'serve', mode: 'development' },
            )
          : null;
      expect(result?.optimizeDeps?.exclude).toEqual(
        expect.arrayContaining(['lib-using-stylex']),
      );
      expect(result?.optimizeDeps?.exclude || []).not.toEqual(
        expect.arrayContaining(['lib-no-stylex']),
      );
      expect(result?.ssr?.optimizeDeps?.exclude).toEqual(
        expect.arrayContaining(['lib-using-stylex']),
      );

      const pluginWithManual = unplugin.vite({
        externalPackages: ['manual-stylex-lib'],
      });
      const manualResult =
        typeof pluginWithManual.config === 'function'
          ? await pluginWithManual.config(
              {},
              { command: 'serve', mode: 'development' },
            )
          : null;
      expect(manualResult?.optimizeDeps?.exclude).toEqual(
        expect.arrayContaining(['manual-stylex-lib', 'lib-using-stylex']),
      );
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('configures Vitest deps.inline for external packages to prevent pre-bundling', async () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-unplugin-vitest-'),
    );
    const originalCwd = process.cwd();
    try {
      const pkgJson = {
        dependencies: {
          '@stark-bp/stylex': '1.0.0',
          '@stark-bp/react': '1.0.0',
        },
      };
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify(pkgJson),
        'utf8',
      );

      // Create mock external package with StyleX
      fs.mkdirSync(
        path.join(tempDir, 'node_modules', '@stark-bp', 'stylex', 'dist'),
        { recursive: true },
      );
      fs.writeFileSync(
        path.join(tempDir, 'node_modules', '@stark-bp', 'stylex', 'package.json'),
        JSON.stringify({
          name: '@stark-bp/stylex',
          version: '1.0.0',
          dependencies: { '@stylexjs/stylex': '^0.17.4' },
        }),
        'utf8',
      );
      // Create a file that uses stylex.defineVars (the error case)
      fs.writeFileSync(
        path.join(tempDir, 'node_modules', '@stark-bp', 'stylex', 'dist', 'tokens.stylex.js'),
        `import stylex from '@stylexjs/stylex';
export const tokens = stylex.defineVars({
  color: 'red',
});`,
        'utf8',
      );

      process.chdir(tempDir);

      // Test with test: true option (required for Vitest deps.inline configuration)
      const plugin = unplugin.vite({
        test: true,
        useCSSLayers: true,
        externalPackages: ['@stark-bp/stylex', '@stark-bp/react'],
      });
      const viteConfigHook = plugin.config;

      // Test with Vitest config
      const vitestConfig = {
        test: {
          include: ['./src/*.spec.tsx'],
          watch: false,
          globals: true,
          environment: 'happy-dom',
        },
      };

      const result =
        typeof viteConfigHook === 'function'
          ? await viteConfigHook.call(plugin, vitestConfig, {
              command: 'serve',
              mode: 'development',
            })
          : null;

      // Should configure optimizeDeps.exclude
      expect(result?.optimizeDeps?.exclude).toEqual(
        expect.arrayContaining(['@stark-bp/stylex', '@stark-bp/react']),
      );

      // Should configure test.deps.inline for Vitest (this is the fix!)
      expect(result?.test).toBeDefined();
      expect(result?.test?.deps?.inline).toEqual(
        expect.arrayContaining(['@stark-bp/stylex', '@stark-bp/react']),
      );

      // Test that external package files are transformed
      // This simulates what happens when Vitest processes external packages
      const externalPackageCode = `import stylex from '@stylexjs/stylex';
export const tokens = stylex.defineVars({
  color: 'red',
});`;
      const externalPackagePath = path.join(
        tempDir,
        'node_modules',
        '@stark-bp',
        'stylex',
        'dist',
        'tokens.stylex.js',
      );

      // Initialize the plugin
      if (typeof plugin.buildStart === 'function') {
        plugin.buildStart();
      }

      const transformResult = await plugin.transform(
        externalPackageCode,
        externalPackagePath,
      );
      // Should transform the file (not return null) because it's from an external package
      expect(transformResult).not.toBeNull();
      expect(transformResult?.code).toBeDefined();
      // The stylex.defineVars should be compiled, not left as runtime call
      expect(transformResult?.code).not.toContain('stylex.defineVars');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
