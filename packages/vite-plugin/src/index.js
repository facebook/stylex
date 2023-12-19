/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */
import path from 'path';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import flowSyntaxPlugin from '@babel/plugin-syntax-flow';
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx';
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript';
import { transformAsync } from '@babel/core';
import { createFilter } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';
import type { Options, Rule } from '@stylexjs/babel-plugin';
import type { NextHandleFunction } from 'connect';
import type { PluginItem } from '@babel/core';

export type PluginOptions = $ReadOnly<{
  ...Omit<Partial<Options>, 'dev' | 'runtimeInjection'>,
  include?: string | RegExp | $ReadOnlyArray<string | RegExp>,
  exclude?: string | RegExp | $ReadOnlyArray<string | RegExp>,
  babelConfig?: $ReadOnly<{
    plugins?: $ReadOnlyArray<PluginItem>,
    presets?: $ReadOnlyArray<PluginItem>,
  }>,
  useCSSLayers?: boolean,
  ...
}>;

const VIRTUAL_STYLEX_MODULE = '\0stylex:virtual';

const VIRTUAL_STYLEX_CSS_MODULE = VIRTUAL_STYLEX_MODULE + '.css';

const VITE_INTERNAL_CSS_PLUGIN_NAMES = ['vite:css', 'vite:css-post'];

const VITE_TRANSFORM_MIDDLEWARE_NAME = 'viteTransformMiddleware';

function createSSRMiddleware(
  processStylexRules: () => string,
): NextHandleFunction {
  return function stylexDevMiddleware(req, res, next) {
    const protocol = 'encrypted' in req.socket ? 'https' : 'http';
    const { host } = req.headers;
    const url = new URL(req.originalUrl, `${protocol}://${host}`);
    // Check style sheet is registered.
    if (
      url.pathname.endsWith('.css') &&
      url.pathname.includes('stylex:virtual')
    ) {
      res.setHeader('Content-Type', 'text/css');
      res.end(processStylexRules());
      return;
    }
    next();
  };
}

export default function stylexPlugin({
  unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
  babelConfig: { plugins = [], presets = [] } = {},
  importSources = ['stylex', '@stylexjs/stylex'],
  useCSSLayers = false,
  include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
  exclude,
  ...options
}: PluginOptions = {}): Plugin<> {
  const filter = createFilter(include, exclude);
  let viteServer: ViteDevServer | null = null;
  let dev = false;
  const viteCSSPlugins: Plugin<>[] = [];

  const processStylexRules = () => {
    const rules = Object.values(stylexRules).flat();
    if (!rules.length) return '';
    return stylexBabelPlugin.processStylexRules(rules, useCSSLayers);
  };

  let stylexRules: { [string]: $ReadOnlyArray<Rule> } = {};

  return {
    name: 'vite-plugin-stylex',
    buildStart() {
      stylexRules = {};
    },
    configureServer(server) {
      viteServer = server;
      // Enable middleware when the project is custrom render or ssr
      // Make sure the insert order
      // Reset the order of the middlewares
      return () => {
        if (
          server.config.appType === 'custom' ||
          server.config.server.middlewareMode
        ) {
          const stylexDevMiddleware = createSSRMiddleware(processStylexRules);
          server.middlewares.use(stylexDevMiddleware);
          const order = server.middlewares.stack.findIndex((m) => {
            if (typeof m.handle === 'function')
              return m.handle.name === VITE_TRANSFORM_MIDDLEWARE_NAME;
            return -1;
          });
          const middleware = server.middlewares.stack.pop();
          if (order !== -1) {
            server.middlewares.stack.splice(order + 1, 0, middleware);
          }
        }
      };
    },
    configResolved(conf) {
      dev = conf.mode !== 'development' || conf.env.mode !== 'development';
      viteCSSPlugins.push(
        ...conf.plugins.filter((p) =>
          VITE_INTERNAL_CSS_PLUGIN_NAMES.includes(p.name),
        ),
      );
      viteCSSPlugins.sort((a, b) =>
        a.name === 'vite:css' && b.name === 'vite:css-post' ? -1 : 1,
      );
    },
    load(id) {
      if (id === VIRTUAL_STYLEX_CSS_MODULE) {
        return processStylexRules();
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_STYLEX_MODULE) return VIRTUAL_STYLEX_CSS_MODULE;
    },
    async transform(inputCode, id) {
      if (!filter(id)) return;
      if (!importSources.some((importName) => inputCode.includes(importName)))
        return;
      const result = await transformAsync(inputCode, {
        babelrc: false,
        filename: id,
        presets,
        plugins: [
          ...plugins,
          /\.jsx?/.test(path.extname(id))
            ? flowSyntaxPlugin
            : typescriptSyntaxPlugin,
          jsxSyntaxPlugin,
          [
            stylexBabelPlugin,
            {
              ...options,
              dev,
              unstable_moduleResolution,
              runtimeInjection: false,
            },
          ],
        ],
      });
      if (result === null) return;
      const { map, metadata } = result;
      let { code } = result;

      if (metadata && 'stylex' in metadata) {
        // $FlowFixMe
        const rules: Rule[] = metadata.stylex;
        if (!rules.length) return;
        if (code) {
          code = `import ${JSON.stringify(VIRTUAL_STYLEX_MODULE)};\n${code}`;
        }
        stylexRules[id] = rules;
      }
      if (viteServer) {
        const { moduleGraph } = viteServer;
        const virtualModule = moduleGraph.getModuleById(
          VIRTUAL_STYLEX_CSS_MODULE,
        );
        if (virtualModule) {
          moduleGraph.invalidateModule(virtualModule, new Set());
          virtualModule.lastHMRTimestamp = Date.now();
        }
      }
      return {
        code,
        map,
        meta: metadata,
      };
    },
    async renderChunk(_, chunk) {
      // plugin_1 is vite:css plugin. Using it we will re set the finally css (Vite using prost-css in here.)
      // plugin_2 is vite:css-post plugin. vite will compress css here.
      const [plugin_1, plugin_2] = viteCSSPlugins;
      for (const moudleId of chunk.moduleIds) {
        if (moudleId.includes(VIRTUAL_STYLEX_CSS_MODULE)) {
          if (
            typeof plugin_1.transform === 'function' &&
            typeof plugin_2.transform === 'function'
          ) {
            const { code: css } = await plugin_1.transform.call(
              // $FlowFixMe
              this,
              processStylexRules(),
              VIRTUAL_STYLEX_CSS_MODULE,
            );
            // $FlowFixMe
            await plugin_2.transform.call(this, css, VIRTUAL_STYLEX_CSS_MODULE);
          }
        }
      }
    },
  };
}
