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

const stylexPlugin = require('../src').default;

// Helper to strip Meta copyright header from transformed output
function stripCopyrightHeader(contents) {
  if (!contents) return contents;
  return contents.replace(
    /\/\*\*\s*\n\s*\*\s*Copyright \(c\) Meta Platforms, Inc\. and affiliates\.[\s\S]*?\*\/\s*\n\s*/,
    '',
  );
}

describe('@stylexjs/bun-plugin', () => {
  const fixturesDir = path.resolve(__dirname, '__fixtures__');

  // Helper to create a mock Bun build context and run the plugin
  async function runStylexBunPlugin(options = {}) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-bun-test-'));

    const plugin = stylexPlugin({
      dev: false,
      fileName: 'stylex.css',
      ...options,
    });

    let onLoadCallback = null;
    let onEndCallback = null;
    const mockBuild = {
      onLoad: (opts, callback) => {
        onLoadCallback = callback;
      },
      onResolve: jest.fn(),
      onEnd: (callback) => {
        onEndCallback = callback;
      },
      config: {
        outdir: tempDir,
      },
    };

    plugin.setup(mockBuild);

    return {
      plugin,
      onLoadCallback,
      tempDir,
      async processFile(filePath) {
        return onLoadCallback({ path: filePath, loader: 'js' });
      },
      async processFiles(filePaths) {
        const results = [];
        for (const filePath of filePaths) {
          results.push(await onLoadCallback({ path: filePath, loader: 'js' }));
        }
        return results;
      },
      async getCSS() {
        // Trigger onEnd callback to write CSS
        if (onEndCallback) {
          onEndCallback({ success: true, outputs: [], logs: [] });
        }

        const cssPath = path.join(tempDir, options.fileName || 'stylex.css');
        // Also check for any .css file in case we're appending
        if (fs.existsSync(cssPath)) {
          return fs.readFileSync(cssPath, 'utf8');
        }
        // Check for other css files
        try {
          const files = fs.readdirSync(tempDir);
          const cssFile = files.find((f) => f.endsWith('.css'));
          if (cssFile) {
            return fs.readFileSync(path.join(tempDir, cssFile), 'utf8');
          }
        } catch {
          // Directory may not exist
        }
        return null;
      },
      cleanup() {
        fs.rmSync(tempDir, { recursive: true, force: true });
      },
    };
  }

  describe('extracts CSS from StyleX files', () => {
    test('basic styles', async () => {
      const { processFile, getCSS, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(path.join(fixturesDir, 'styles.js'));

        expect(result).toBeDefined();
        expect(stripCopyrightHeader(result.contents)).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            container: {
              kWkggS: "xrkmrrc",
              $$css: true
            }
          };"
        `);

        const css = await getCSS();
        expect(css).toMatchInlineSnapshot(`
          ".xrkmrrc {
            background-color: red;
          }
          "
        `);
      } finally {
        cleanup();
      }
    });

    test('multiple styles files', async () => {
      const { processFiles, getCSS, cleanup } = await runStylexBunPlugin();

      try {
        const results = await processFiles([
          path.join(fixturesDir, 'styles.js'),
          path.join(fixturesDir, 'styles-second.js'),
        ]);

        expect(stripCopyrightHeader(results[0].contents))
          .toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            container: {
              kWkggS: "xrkmrrc",
              $$css: true
            }
          };"
        `);

        expect(stripCopyrightHeader(results[1].contents))
          .toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            second: {
              kWkggS: "x1u857p9",
              $$css: true
            }
          };"
        `);

        const css = await getCSS();
        expect(css).toMatchInlineSnapshot(`
          ".x1u857p9 {
            background-color: green;
          }

          .xrkmrrc {
            background-color: red;
          }
          "
        `);
      } finally {
        cleanup();
      }
    });

    test('complex styles with keyframes and pseudo-selectors', async () => {
      const { processFile, getCSS, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(
          path.join(fixturesDir, 'complex-styles.js'),
        );

        expect(result).toBeDefined();
        expect(stripCopyrightHeader(result.contents)).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          const fadeAnimation = "xgnty7z-B";
          export const styles = {
            foo: {
              kKVMdj: "xeuoslp",
              kWkggS: "x1gykpug",
              krdFHd: "xu4yf9m",
              k1xSpc: "x78zum5",
              kZKoxP: "x1egiwwb",
              keTefX: "x1hm9lzh",
              keoZOQ: "xlrshdv",
              $$css: true
            }
          };
          export default function App() {
            return {
              className: "xeuoslp x1gykpug xu4yf9m x78zum5 x1egiwwb x1hm9lzh xlrshdv"
            };
          }"
        `);

        const css = await getCSS();
        expect(css).toMatchInlineSnapshot(`
          "@keyframes xgnty7z-B {
            0% {
              opacity: .25;
            }

            100% {
              opacity: 1;
            }
          }

          .xeuoslp:not(#\\#) {
            animation-name: xgnty7z-B;
          }

          .xu4yf9m:not(#\\#) {
            border-start-start-radius: 7.5px;
          }

          .x78zum5:not(#\\#) {
            display: flex;
          }

          .x1hm9lzh:not(#\\#) {
            margin-inline-start: 10px;
          }

          .x1gykpug:hover:not(#\\#) {
            background-color: red;
          }

          .x1egiwwb:not(#\\#):not(#\\#) {
            height: 500px;
          }

          .xlrshdv:not(#\\#):not(#\\#) {
            margin-top: 99px;
          }
          "
        `);
      } finally {
        cleanup();
      }
    });
  });

  describe('handles files without StyleX', () => {
    test('ignores files without StyleX imports', async () => {
      const { processFile, getCSS, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(
          path.join(fixturesDir, 'non-stylex.js'),
        );

        expect(result).toBeUndefined();

        const css = await getCSS();
        expect(css).toBeNull();
      } finally {
        cleanup();
      }
    });
  });

  describe('supports CSS layers', () => {
    test('wraps CSS in @layer when useCSSLayers is true', async () => {
      const { processFile, getCSS, cleanup } = await runStylexBunPlugin({
        useCSSLayers: true,
      });

      try {
        await processFile(path.join(fixturesDir, 'styles.js'));

        const css = await getCSS();
        expect(css).toContain('@layer');
        expect(css).toMatchInlineSnapshot(`
          "@layer priority1 {
            .xrkmrrc {
              background-color: red;
            }
          }
          "
        `);
      } finally {
        cleanup();
      }
    });

    test('CSS layers with multiple files', async () => {
      const { processFiles, getCSS, cleanup } = await runStylexBunPlugin({
        useCSSLayers: true,
      });

      try {
        await processFiles([
          path.join(fixturesDir, 'styles.js'),
          path.join(fixturesDir, 'styles-second.js'),
        ]);

        const css = await getCSS();
        expect(css).toMatchInlineSnapshot(`
          "@layer priority1 {
            .x1u857p9 {
              background-color: green;
            }

            .xrkmrrc {
              background-color: red;
            }
          }
          "
        `);
      } finally {
        cleanup();
      }
    });
  });

  describe('TypeScript/TSX support', () => {
    test('transforms TSX files', async () => {
      const { processFile, getCSS, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(path.join(fixturesDir, 'styles.tsx'));

        expect(result).toBeDefined();
        expect(result.loader).toBe('tsx');
        expect(stripCopyrightHeader(result.contents)).toMatchInlineSnapshot(`
          "import * as stylex from '@stylexjs/stylex';
          export const styles = {
            button: {
              kWkggS: "x1t391ir",
              kMwMTN: "x1awj2ng",
              kmVPX3: "x7z7khe",
              $$css: true
            }
          };"
        `);

        const css = await getCSS();
        expect(css).toMatchInlineSnapshot(`
          ".x7z7khe {
            padding: 10px;
          }

          .x1t391ir:not(#\\#) {
            background-color: #00f;
          }

          .x1awj2ng:not(#\\#) {
            color: #fff;
          }
          "
        `);
      } finally {
        cleanup();
      }
    });
  });

  describe('plugin configuration', () => {
    test('exports a function that returns a Bun plugin', () => {
      expect(typeof stylexPlugin).toBe('function');

      const plugin = stylexPlugin({});
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('bun-plugin-stylex');
      expect(typeof plugin.setup).toBe('function');
    });

    test('setup function registers onLoad and onEnd callbacks', () => {
      const plugin = stylexPlugin({});

      const mockOnLoad = jest.fn();
      const mockOnResolve = jest.fn();
      const mockOnEnd = jest.fn();
      const mockBuild = {
        onLoad: mockOnLoad,
        onResolve: mockOnResolve,
        onEnd: mockOnEnd,
        config: {
          outdir: '/tmp/test-out',
        },
      };

      plugin.setup(mockBuild);

      expect(mockOnLoad).toHaveBeenCalledTimes(1);
      expect(mockOnLoad).toHaveBeenCalledWith(
        { filter: /\.[cm]?[jt]sx?$/ },
        expect.any(Function),
      );
      expect(mockOnEnd).toHaveBeenCalledTimes(1);
      expect(mockOnEnd).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('edge cases', () => {
    test('handles non-existent files gracefully', async () => {
      const { processFile, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(
          path.join(fixturesDir, 'does-not-exist.js'),
        );
        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    test('handles empty file gracefully', async () => {
      const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'stylex-bun-test-'),
      );
      const emptyFile = path.join(tempDir, 'empty.js');
      fs.writeFileSync(emptyFile, '', 'utf8');

      const { processFile, cleanup } = await runStylexBunPlugin();

      try {
        const result = await processFile(emptyFile);
        expect(result).toBeUndefined();
      } finally {
        cleanup();
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test('resets state between builds', () => {
      const plugin = stylexPlugin({});

      // First setup
      plugin.setup({
        onLoad: jest.fn(),
        onResolve: jest.fn(),
        onEnd: jest.fn(),
        config: { outdir: '/tmp/test1' },
      });

      // Second setup should reset state
      plugin.setup({
        onLoad: jest.fn(),
        onResolve: jest.fn(),
        onEnd: jest.fn(),
        config: { outdir: '/tmp/test2' },
      });

      expect(plugin.name).toBe('bun-plugin-stylex');
    });
  });
});
