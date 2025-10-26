/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import flowSyntaxPlugin from '@babel/plugin-syntax-flow';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import path from 'node:path';
import { transform as lightningTransform } from 'lightningcss';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

/**
 * Try to pick a stable CSS asset to inject into.
 * - Prefer files named like `style.css` or `index.css`
 * - Otherwise, first .css asset encountered
 */
function pickCssAssetFromRollupBundle(bundle, choose) {
  const assets = Object.values(bundle).filter(
    (a) =>
      a &&
      a.type === 'asset' &&
      typeof a.fileName === 'string' &&
      a.fileName.endsWith('.css'),
  );
  if (assets.length === 0) return null;
  if (typeof choose === 'function') {
    const chosen = assets.find((a) => choose(a.fileName));
    if (chosen) return chosen;
  }
  const best =
    assets.find((a) => /(^|\/)index\.css$/.test(a.fileName)) ||
    assets.find((a) => /(^|\/)style\.css$/.test(a.fileName));
  return best || assets[0];
}

function processCollectedRulesToCSS(rules, options) {
  if (!rules || rules.length === 0) return '';
  const collectedCSS = stylexBabelPlugin.processStylexRules(rules, {
    useLayers: !!options.useCSSLayers,
    enableLTRRTLComments: options?.enableLTRRTLComments,
  });
  const { code } = lightningTransform({
    targets: browserslistToTargets(browserslist('>= 1%')),
    ...options.lightningcssOptions,
    filename: 'stylex.css',
    code: Buffer.from(collectedCSS),
  });
  return code.toString();
}

const unpluginInstance = createUnplugin((userOptions = {}) => {
  const {
    dev = process.env.NODE_ENV === 'development' ||
      process.env.BABEL_ENV === 'development',
    unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
    babelConfig: { plugins = [], presets = [] } = {},
    importSources = ['stylex', '@stylexjs/stylex'],
    useCSSLayers = false,
    lightningcssOptions,
    cssInjectionTarget,
    ...stylexOptions
  } = userOptions;

  // Shared state across a single compilation
  const stylexRulesById = new Map(); // id -> Rule[]

  async function runBabelTransform(inputCode, id, callerName) {
    const result = await transformAsync(inputCode, {
      babelrc: false,
      filename: id,
      presets,
      plugins: [
        ...plugins,
        /\.jsx?/.test(path.extname(id))
          ? flowSyntaxPlugin
          : [typescriptSyntaxPlugin, { isTSX: true }],
        jsxSyntaxPlugin,
        stylexBabelPlugin.withOptions({
          ...stylexOptions,
          dev,
          unstable_moduleResolution,
        }),
      ],
      caller: {
        name: callerName,
        supportsStaticESM: true,
        supportsDynamicImport: true,
        supportsTopLevelAwait: !inputCode.includes('require('),
        supportsExportNamespaceFrom: true,
      },
    });

    if (!result || result.code == null) {
      return { code: inputCode, map: null, metadata: {} };
    }
    return result;
  }

  function shouldHandle(code) {
    if (!code) return false;
    return importSources.some((importName) =>
      typeof importName === 'string'
        ? code.includes(importName)
        : code.includes(importName.from),
    );
  }

  function resetState() {
    stylexRulesById.clear();
  }

  function collectCss() {
    const allRules = Array.from(stylexRulesById.values()).flat();
    return processCollectedRulesToCSS(allRules, {
      useCSSLayers,
      lightningcssOptions,
      enableLTRRTLComments: stylexOptions?.enableLTRRTLComments,
    });
  }

  return {
    name: '@stylexjs/unplugin',

    // Vite/Rollup lifecycle resets
    buildStart() {
      resetState();
    },
    buildEnd() {
      // No-op; generateBundle handles injection for rollup-like bundlers.
    },

    // Core code transform
    async transform(code, id) {
      if (!shouldHandle(code)) return null;
      const result = await runBabelTransform(code, id, '@stylexjs/unplugin');
      const { metadata } = result;
      if (
        !stylexOptions.runtimeInjection &&
        metadata &&
        Array.isArray(metadata.stylex) &&
        metadata.stylex.length > 0
      ) {
        stylexRulesById.set(id, metadata.stylex);
      }

      // Rollup/Vite watch-mode support: collect stylex metadata from cached deps
      // Only when running in rollup-like context
      // $FlowExpectedError[incompatible-use]
      const ctx = this;
      if (
        ctx &&
        ctx.meta &&
        ctx.meta.watchMode &&
        typeof ctx.parse === 'function'
      ) {
        try {
          const ast = ctx.parse(result.code);
          for (const stmt of ast.body) {
            if (stmt.type === 'ImportDeclaration') {
              // $FlowExpectedError[incompatible-call]
              const resolved = await ctx.resolve(stmt.source.value, id);
              if (resolved && !resolved.external) {
                // $FlowExpectedError[incompatible-call]
                const loaded = await ctx.load(resolved);
                if (loaded && loaded.meta && 'stylex' in loaded.meta) {
                  stylexRulesById.set(resolved.id, loaded.meta.stylex);
                }
              }
            }
          }
        } catch {}
      }
      return { code: result.code, map: result.map };
    },

    // Rollup: ensure cached modules still provide their metadata
    shouldTransformCachedModule({ id, meta }) {
      if (meta && 'stylex' in meta) {
        stylexRulesById.set(id, meta.stylex);
      }
      return false;
    },

    // Rollup/Vite: append to an existing CSS asset
    generateBundle(_opts, bundle) {
      const css = collectCss();
      if (!css) return;
      const target = pickCssAssetFromRollupBundle(bundle, cssInjectionTarget);
      if (!target) {
        this.warn(
          '[stylex] No existing CSS asset found to inject into. Skipping.',
        );
        return;
      }
      const current =
        typeof target.source === 'string'
          ? target.source
          : target.source?.toString() || '';
      target.source = current ? current + '\n' + css : css;
    },

    // webpack/rspack integration
    webpack(compiler) {
      const PLUGIN_NAME = '@stylexjs/unplugin';
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        // Reset per-compilation to avoid carry-over in watch mode
        resetState();

        // After assets optimized, inject into an existing CSS asset
        const wp = compiler.webpack || compiler.rspack || undefined;
        const stage = wp?.Compilation?.PROCESS_ASSETS_STAGE_SUMMARIZE;
        const tapOptions =
          stage != null ? { name: PLUGIN_NAME, stage } : PLUGIN_NAME;
        const toRawSource = (content) => {
          const RawSource = wp?.sources?.RawSource;
          return RawSource
            ? new RawSource(content)
            : { source: () => content, size: () => Buffer.byteLength(content) };
        };
        compilation.hooks.processAssets.tap(tapOptions, (assets) => {
          const css = collectCss();
          if (!css) return;

          const cssAssets = Object.keys(assets).filter((f) =>
            f.endsWith('.css'),
          );
          if (cssAssets.length === 0) {
            compilation.warnings.push(
              new Error(
                '[stylex] No CSS asset found to inject into. Skipping.',
              ),
            );
            return;
          }

          const pickName =
            (typeof cssInjectionTarget === 'function' &&
              cssAssets.find((f) => cssInjectionTarget(f))) ||
            cssAssets.find((f) => /(^|\/)index\.css$/.test(f)) ||
            cssAssets.find((f) => /(^|\/)style\.css$/.test(f)) ||
            cssAssets[0];

          const asset = compilation.getAsset(pickName);
          if (!asset) return;
          const existing = asset.source.source().toString();
          const next = existing ? existing + '\n' + css : css;
          compilation.updateAsset(pickName, toRawSource(next));
        });
      });
    },

    // rspack reuses webpack hook
    rspack(compiler) {
      // Most Rspack versions expose a webpack-compatible interface
      // Delegate to webpack(compiler)
      this.webpack?.(compiler);
    },
  };
});

export default unpluginInstance;
export const unplugin = unpluginInstance;
