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
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { transform as lightningTransform } from 'lightningcss';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

import { devInjectMiddleware } from './dev-inject-middleware';
import {
  DEV_CSS_PATH,
  VIRTUAL_STYLEX_RUNTIME_SCRIPT,
  VIRTUAL_STYLEX_CSS_ONLY_SCRIPT,
} from './consts';

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

const unpluginInstance = createUnplugin((userOptions = {}, metaOptions) => {
  // framework :: 'rollup' | 'vite' | 'rolldown' | 'farm' | 'unloader'
  const framework = metaOptions?.framework;
  const {
    dev = process.env.NODE_ENV === 'development' ||
      process.env.BABEL_ENV === 'development',
    unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
    babelConfig: { plugins = [], presets = [] } = {},
    importSources = ['stylex', '@stylexjs/stylex'],
    useCSSLayers = false,
    lightningcssOptions,
    cssInjectionTarget,
    // Persist rules to disk in dev to bridge multiple plugin containers/processes.
    // Off by default; enable if your dev setup runs separate Node processes per environment.
    devPersistToDisk = false,
    // Dev integration mode: 'full' (runtime + html), 'css-only' (serve CSS endpoint only), 'off'
    devMode = 'full',
    treeshakeCompensation = ['vite', 'rollup', 'rolldown'].includes(framework),
    ...stylexOptions
  } = userOptions;

  // Shared state across a single compilation (used for builds)
  const stylexRulesById = new Map(); // id -> Rule[]
  // Global shared store for Vite dev to aggregate across environments (client/ssr/rsc)
  function getSharedStore() {
    try {
      const g = globalThis;
      if (!g.__stylex_unplugin_store) {
        g.__stylex_unplugin_store = { rulesById: new Map(), version: 0 };
      }
      return g.__stylex_unplugin_store;
    } catch {
      return { rulesById: stylexRulesById, version: 0 };
    }
  }

  let viteServer = null;
  let viteOutDir = null;
  // Resolve nearest node_modules and cache under node_modules/.stylex/rules.json
  function findNearestNodeModules(startDir) {
    let dir = startDir;
    // Walk upwards until we find a node_modules directory or hit the FS root
    for (;;) {
      const candidate = path.join(dir, 'node_modules');
      if (fs.existsSync(candidate)) {
        const stat = fs.statSync(candidate);
        if (stat.isDirectory()) return candidate;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return null;
  }
  const NEAREST_NODE_MODULES = findNearestNodeModules(process.cwd());
  const DISK_RULES_DIR = NEAREST_NODE_MODULES
    ? path.join(NEAREST_NODE_MODULES, '.stylex')
    : path.join(process.cwd(), 'node_modules', '.stylex');
  const DISK_RULES_PATH = path.join(DISK_RULES_DIR, 'rules.json');

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
          treeshakeCompensation,
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

  function escapeReg(src) {
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function containsStylexImport(code, source) {
    const s = escapeReg(typeof source === 'string' ? source : source.from);
    const re = new RegExp(
      // import ... from 'source' | import('source') | require('source') | import 'source'
      `(?:from\\s*['"]${s}['"]|import\\s*\\(\\s*['"]${s}['"]\\s*\\)|require\\s*\\(\\s*['"]${s}['"]\\s*\\)|^\\s*import\\s*['"]${s}['"])`,
      'm',
    );
    return re.test(code);
  }

  function shouldHandle(code) {
    if (!code) return false;
    return importSources.some((src) => containsStylexImport(code, src));
  }

  function resetState() {
    stylexRulesById.clear();
    if (devPersistToDisk) {
      try {
        fs.rmSync(DISK_RULES_PATH, { force: true });
      } catch {}
    }
  }

  function collectCss() {
    const merged = new Map();
    if (devPersistToDisk) {
      try {
        if (fs.existsSync(DISK_RULES_PATH)) {
          const json = JSON.parse(fs.readFileSync(DISK_RULES_PATH, 'utf8'));
          for (const [k, v] of Object.entries(json)) merged.set(k, v);
        }
      } catch {}
    }
    try {
      const shared = getSharedStore().rulesById;
      for (const [k, v] of shared.entries()) merged.set(k, v);
    } catch {}
    for (const [k, v] of stylexRulesById.entries()) merged.set(k, v);
    const allRules = Array.from(merged.values()).flat();
    return processCollectedRulesToCSS(allRules, {
      useCSSLayers,
      lightningcssOptions,
      enableLTRRTLComments: stylexOptions?.enableLTRRTLComments,
    });
  }

  async function persistRulesToDisk(id, rules) {
    if (!devPersistToDisk) return;
    try {
      let current = {};
      try {
        const txt = await fsp.readFile(DISK_RULES_PATH, 'utf8');
        current = JSON.parse(txt);
      } catch {}
      if (rules && Array.isArray(rules) && rules.length > 0) {
        current[id] = rules;
      } else if (current[id]) {
        delete current[id];
      }
      await fsp.writeFile(DISK_RULES_PATH, JSON.stringify(current), 'utf8');
    } catch {}
  }

  // No rollup-style virtual module normalize for webpack/rspack stability

  return {
    name: '@stylexjs/unplugin',
    apply: (config, env) => {
      try {
        const command =
          env?.command || (typeof config === 'string' ? undefined : undefined);
        if (devMode === 'off' && command === 'serve') return false;
      } catch {}
      return true;
    },
    // Ensure we run before React refresh transforms so HMR stays intact
    enforce: 'pre',

    // Vite/Rollup lifecycle resets
    buildStart() {
      resetState();
    },
    buildEnd() {
      // No-op; generateBundle handles injection for rollup-like bundlers.
    },

    // No generic resolve/load; Vite dev uses middleware link, build uses generateBundle

    // Core code transform
    async transform(code, id) {
      // Only handle JS-like files; avoid parsing CSS/JSON/etc
      const JS_LIKE_RE = /\.[cm]?[jt]sx?(\?|$)/;
      if (!JS_LIKE_RE.test(id)) return null;
      if (!shouldHandle(code)) return null;
      const result = await runBabelTransform(code, id, '@stylexjs/unplugin');
      const { metadata } = result;
      if (!stylexOptions.runtimeInjection) {
        const hasRules =
          metadata &&
          Array.isArray(metadata.stylex) &&
          metadata.stylex.length > 0;
        const shared = getSharedStore();
        if (hasRules) {
          stylexRulesById.set(id, metadata.stylex);
          shared.rulesById.set(id, metadata.stylex);
          shared.version++;
          await persistRulesToDisk(id, metadata.stylex);
        } else {
          stylexRulesById.delete(id);
          if (shared.rulesById.has(id)) {
            shared.rulesById.delete(id);
            shared.version++;
          }
          await persistRulesToDisk(id, []);
        }
        // Notify runtime via custom event; avoid Vite-internal 'update' messages
        if (viteServer) {
          try {
            viteServer.ws.send({ type: 'custom', event: 'stylex:css-update' });
          } catch {}
        }
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

    // Rollup/Vite: append to an existing CSS asset during generateBundle
    // Note: some bundlers/plugins may mutate CSS assets later; we also guard in writeBundle.
    generateBundle(_opts, bundle) {
      const css = collectCss();
      if (!css) return;
      const target = pickCssAssetFromRollupBundle(bundle, cssInjectionTarget);
      if (target) {
        const current =
          typeof target.source === 'string'
            ? target.source
            : target.source?.toString() || '';
        target.source = current ? current + '\n' + css : css;
      } else {
        // Defer to writeBundle to append or emit fallback file
      }
    },

    // Vite: dev virtual modules + HMR
    vite:
      devMode === 'off'
        ? undefined
        : {
            configResolved(config) {
              try {
                viteOutDir = config.build?.outDir || viteOutDir;
              } catch {}
            },
            configureServer(server) {
              viteServer = server;
              if (devMode === 'full') {
                // Serve dev runtime script
                server.middlewares.use(devInjectMiddleware);
              }
              // Serve dev CSS payload (used by both 'full' and 'css-only' modes)
              server.middlewares.use((req, res, next) => {
                if (!req.url) return next();
                if (req.url.startsWith(DEV_CSS_PATH)) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'text/css');
                  res.setHeader('Cache-Control', 'no-store');
                  const css = collectCss();
                  res.end(css || '');
                  return;
                }
                next();
              });
              // Poll shared store to emit HMR custom event
              const shared = getSharedStore();
              let lastVersion = shared.version;
              const interval = setInterval(() => {
                const curr = shared.version;
                if (curr !== lastVersion) {
                  lastVersion = curr;
                  try {
                    server.ws.send({
                      type: 'custom',
                      event: 'stylex:css-update',
                    });
                  } catch {}
                }
              }, 150);
              server.httpServer?.once('close', () => clearInterval(interval));
            },
            resolveId(id) {
              if (devMode === 'full' && id === 'virtual:stylex:runtime')
                return id;
              if (devMode === 'css-only' && id === 'virtual:stylex:css-only')
                return id;
              return null;
            },
            load(id) {
              if (devMode === 'full' && id === 'virtual:stylex:runtime') {
                return VIRTUAL_STYLEX_RUNTIME_SCRIPT;
              }
              if (devMode === 'css-only' && id === 'virtual:stylex:css-only') {
                return VIRTUAL_STYLEX_CSS_ONLY_SCRIPT;
              }
              return null;
            },

            // No Vite virtual module hooks are needed now

            transformIndexHtml() {
              if (devMode !== 'full') return null;
              if (!viteServer) return null;
              return [
                {
                  tag: 'script',
                  attrs: { type: 'module', src: '/@id/virtual:stylex:runtime' },
                  injectTo: 'head',
                },
                {
                  tag: 'link',
                  attrs: { rel: 'stylesheet', href: DEV_CSS_PATH },
                  injectTo: 'head',
                },
              ];
            },
            handleHotUpdate(ctx) {
              // Do not alter Vite's module list; preserve JS HMR.
              // Invalidate CSS module and notify runtime to refetch.
              const cssMod = ctx.server.moduleGraph.getModuleById(
                'virtual:stylex:css-module',
              );
              if (cssMod) {
                ctx.server.moduleGraph.invalidateModule(cssMod);
              }
              try {
                ctx.server.ws.send({
                  type: 'custom',
                  event: 'stylex:css-update',
                });
              } catch {}
            },
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

    // esbuild integration
    esbuild: {
      name: '@stylexjs/unplugin',
      setup(build) {
        // No special onResolve/onLoad needed as unplugin will wrap transform.
        // After build finishes, append or emit CSS similar to writeBundle.
        build.onEnd(async (result) => {
          try {
            const css = collectCss();
            if (!css) return;
            const initial = build.initialOptions;
            const outDir =
              initial.outdir ||
              (initial.outfile ? path.dirname(initial.outfile) : null);
            if (!outDir) return;
            // Attempt to locate an existing CSS output via metafile (if enabled)
            let outfile = null;
            const meta = result && result.metafile;
            if (meta && meta.outputs) {
              const outputs = Object.keys(meta.outputs);
              const cssOutputs = outputs.filter((f) => f.endsWith('.css'));
              const pick =
                cssOutputs.find((f) => /(^|\/)index\.css$/.test(f)) ||
                cssOutputs.find((f) => /(^|\/)style\.css$/.test(f)) ||
                cssOutputs[0];
              if (pick)
                outfile = path.isAbsolute(pick)
                  ? pick
                  : path.join(process.cwd(), pick);
            } else {
              // Fallback: scan outDir for any .css
              try {
                const files = fs
                  .readdirSync(outDir)
                  .filter((f) => f.endsWith('.css'));
                const pick =
                  files.find((f) => /(^|\/)index\.css$/.test(f)) ||
                  files.find((f) => /(^|\/)style\.css$/.test(f)) ||
                  files[0];
                if (pick) outfile = path.join(outDir, pick);
              } catch {}
            }
            // If none found, emit standalone stylex.css
            if (!outfile) {
              const fallback = path.join(outDir, 'stylex.css');
              await fsp.mkdir(path.dirname(fallback), { recursive: true });
              await fsp.writeFile(fallback, css, 'utf8');
              return;
            }
            // Append to selected CSS file
            try {
              const current = fs.readFileSync(outfile, 'utf8');
              if (!current.includes(css)) {
                await fsp.writeFile(
                  outfile,
                  current ? current + '\n' + css : css,
                  'utf8',
                );
              }
            } catch {}
          } catch {}
        });
      },
    },

    async writeBundle(options, bundle) {
      // Final safeguard to ensure CSS ends up in the written asset on disk
      try {
        const css = collectCss();
        if (!css) return;
        const target = pickCssAssetFromRollupBundle(bundle, cssInjectionTarget);
        const outDir =
          options?.dir ||
          (options?.file ? path.dirname(options.file) : viteOutDir);
        if (!outDir) return;
        // ensure outDir exists
        try {
          await fsp.mkdir(outDir, { recursive: true });
        } catch {}
        let outfile;
        if (!target) {
          // If rollup bundle didn't expose CSS asset, try finding one on disk now
          try {
            const assetsDir = path.join(outDir, 'assets');
            if (fs.existsSync(assetsDir)) {
              const files = fs
                .readdirSync(assetsDir)
                .filter((f) => f.endsWith('.css'));
              const pick =
                files.find((f) => /(^|\/)index\.css$/.test(f)) ||
                files.find((f) => /(^|\/)style\.css$/.test(f)) ||
                files[0];
              if (pick) outfile = path.join(assetsDir, pick);
            }
          } catch {}
          // If still not found, emit a standalone stylex.css
          if (!outfile) {
            // Also write a stable asset within assets/ for static servers that serve only from assets/
            const assetsDir = path.join(outDir, 'assets');
            try {
              await fsp.mkdir(assetsDir, { recursive: true });
            } catch {}
            const fallback = path.join(assetsDir, 'stylex.css');
            await fsp.writeFile(fallback, css, 'utf8');
            return;
          }
        } else {
          outfile = path.join(outDir, target.fileName);
        }
        // Append to chosen outfile if not already present
        try {
          const current = fs.readFileSync(outfile, 'utf8');
          if (!current.includes(css)) {
            await fsp.writeFile(
              outfile,
              current ? current + '\n' + css : css,
              'utf8',
            );
          }
        } catch {}
      } catch {}
    },

    // No-op closeBundle; all file writes handled in writeBundle
  };
});

export default unpluginInstance;
export const unplugin = unpluginInstance;
