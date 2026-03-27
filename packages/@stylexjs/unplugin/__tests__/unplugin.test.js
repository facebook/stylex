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
    const plugin = unplugin.rollup({
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

  test('writeBundle is skipped when generateBundle already injected CSS (Vite 8)', async () => {
    const plugin = unplugin.vite({
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
    await plugin.transform(source, '/virtual/example.js');

    // Simulate Vite 8: CSS asset exists in bundle during generateBundle
    const bundle = {
      'assets/index-abc123.css': {
        type: 'asset',
        fileName: 'assets/index-abc123.css',
        source: '/* existing css */',
      },
    };
    const emittedFiles = {};
    const ctx = {
      emitFile(file) {
        const id = 'ref_1';
        emittedFiles[id] = file;
        return id;
      },
      getFileName(id) {
        return emittedFiles[id]?.name
          ? 'assets/' + emittedFiles[id].name
          : null;
      },
    };

    plugin.generateBundle.call(ctx, {}, bundle);

    // generateBundle should have injected CSS into the bundle
    const cssAssets = Object.values(bundle).filter(
      (a) => a.type === 'asset' && a.fileName.endsWith('.css'),
    );
    expect(cssAssets.length).toBeGreaterThan(0);
    const injectedAsset = cssAssets.find((a) =>
      typeof a.source === 'string' ? a.source.includes('color') : false,
    );
    expect(injectedAsset).toBeTruthy();

    // Now simulate writeBundle — it should be a no-op
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-unplugin-vite8-'),
    );
    try {
      const assetsDir = path.join(tempDir, 'assets');
      fs.mkdirSync(assetsDir, { recursive: true });
      // Write initial CSS file that writeBundle might try to append to
      fs.writeFileSync(
        path.join(assetsDir, 'index-abc123.css'),
        '/* existing css */',
        'utf8',
      );
      await plugin.writeBundle(
        { dir: tempDir },
        {
          'assets/index-abc123.css': {
            type: 'asset',
            fileName: 'assets/index-abc123.css',
            source: '/* existing css */',
          },
        },
      );
      // The file on disk should NOT have StyleX CSS appended
      const diskContent = fs.readFileSync(
        path.join(assetsDir, 'index-abc123.css'),
        'utf8',
      );
      expect(diskContent).toBe('/* existing css */');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('writeBundle still works as fallback when no CSS asset in generateBundle', async () => {
    const plugin = unplugin.vite({
      runtimeInjection: false,
      devPersistToDisk: false,
      dev: false,
    });
    if (typeof plugin.buildStart === 'function') {
      plugin.buildStart();
    }
    const source = `
      import * as stylex from '@stylexjs/stylex';
      const styles = stylex.create({ bar: { color: 'blue' } });
      export default styles;
    `;
    await plugin.transform(source, '/virtual/example.js');

    // generateBundle with empty bundle (no CSS assets) — like SSR
    const ctx = {
      emitFile() {
        return 'ref_1';
      },
      getFileName() {
        return null;
      },
    };
    plugin.generateBundle.call(ctx, {}, {});

    // writeBundle should still create fallback CSS
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'stylex-unplugin-fallback-'),
    );
    try {
      await plugin.writeBundle({ dir: tempDir }, {});
      const cssPath = path.join(tempDir, 'assets', 'stylex.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      expect(cssContent).toContain('color:');
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
});
