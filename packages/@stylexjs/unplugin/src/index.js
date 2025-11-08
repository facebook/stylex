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
    // Persist rules to disk in dev to bridge multiple plugin containers/processes.
    // Off by default; enable if your dev setup runs separate Node processes per environment.
    devPersistToDisk = false,
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
  const DEV_CSS_PATH = '/virtual:stylex.css';
  const DEV_RUNTIME_PATH = '/virtual:stylex.js';
  const DEV_AFTER_UPDATE_DELAY = 180; // ms
  let viteServer = null;
  let viteOutDir = null;
  const DISK_RULES_PATH = path.join(process.cwd(), '.stylex-rules.json');

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
    vite: {
      configResolved(config) {
        try {
          viteOutDir = config.build?.outDir || viteOutDir;
        } catch {}
      },
      configureServer(server) {
        viteServer = server;
        // Serve dev runtime script
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          if (req.url.startsWith(DEV_RUNTIME_PATH)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/javascript');
            res.end(`
const STYLE_ID='__stylex_virtual__';
const DEV_CSS_PATH='${DEV_CSS_PATH}';
const AFTER_UPDATE_DELAY=180; // ms
const POLL_INTERVAL=800; // ms
let lastCSS='';
function ensure(){let el=document.getElementById(STYLE_ID);if(!el){el=document.createElement('style');el.id=STYLE_ID;document.head.appendChild(el);}return el;}
function disableLink(){try{const links=[...document.querySelectorAll('link[rel=\\"stylesheet\\"]')];for(const l of links){if(typeof l.href==='string'&&l.href.includes(DEV_CSS_PATH)){l.disabled=true;}}}catch{}}
async function fetchCSS(){
  const t=Date.now();
  const r=await fetch(DEV_CSS_PATH+'?t='+t,{cache:'no-store'});
  return r.text();
}
async function update(){
  try{
    const css=await fetchCSS();
    if(css!==lastCSS){
      ensure().textContent=css;
      disableLink();
      lastCSS=css;
    }
  }catch{}
}
update();
// const __stylex_poll = setInterval(()=>update(), POLL_INTERVAL);
if(import.meta.hot){
  import.meta.hot.on('stylex:css-update',()=>update());
  import.meta.hot.on('vite:afterUpdate',()=>setTimeout(()=>update(),AFTER_UPDATE_DELAY));
  // import.meta.hot.dispose(()=>{ clearInterval(__stylex_poll); const el=document.getElementById(STYLE_ID); if(el&&el.parentNode)el.parentNode.removeChild(el); });
}
export {};
`);
            return;
          }
          next();
        });
        // Serve dev CSS payload
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
              server.ws.send({ type: 'custom', event: 'stylex:css-update' });
            } catch {}
          }
        }, 150);
        server.httpServer?.once('close', () => clearInterval(interval));
      },
      resolveId(id) {
        if (id === 'virtual:stylex:runtime') return id;
        return null;
      },
      load(id) {
        if (id === 'virtual:stylex:runtime') {
          return `
const STYLE_ID='__stylex_virtual__';
const DEV_CSS_PATH='${DEV_CSS_PATH}';
const AFTER_UPDATE_DELAY=${DEV_AFTER_UPDATE_DELAY};
let lastCSS='';
function ensure(){let el=document.getElementById(STYLE_ID);if(!el){el=document.createElement('style');el.id=STYLE_ID;document.head.appendChild(el);}return el;}
function disableLink(){try{const links=[...document.querySelectorAll('link[rel="stylesheet"]')];for(const l of links){if(typeof l.href==='string'&&l.href.includes(DEV_CSS_PATH)){l.disabled=true;}}}catch{}}
async function fetchCSS(){ const t=Date.now(); const r=await fetch(DEV_CSS_PATH+'?t='+t,{cache:'no-store'}); return r.text(); }
async function update(){ try{ const css=await fetchCSS(); if(css!==lastCSS){ ensure().textContent=css; disableLink(); lastCSS=css; } }catch{} }
update();
if(import.meta.hot){ import.meta.hot.on('stylex:css-update',()=>update()); import.meta.hot.on('vite:afterUpdate',()=>setTimeout(()=>update(),AFTER_UPDATE_DELAY)); import.meta.hot.dispose(()=>{ const el=document.getElementById(STYLE_ID); if(el&&el.parentNode)el.parentNode.removeChild(el); }); }
export {};
`;
        }
        return null;
      },

      // No Vite virtual module hooks are needed now

      transformIndexHtml() {
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
          ctx.server.ws.send({ type: 'custom', event: 'stylex:css-update' });
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
            const fallback = path.join(outDir, 'stylex.css');
            if (!fs.existsSync(fallback)) {
              await fsp.writeFile(fallback, css, 'utf8');
            }
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
