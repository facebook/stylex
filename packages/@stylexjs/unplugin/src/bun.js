/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'node:path';
import fsp from 'node:fs/promises';
import { createEsbuildPlugin } from 'unplugin';

import { unpluginFactory } from './core';

const bunPluginFactory = createEsbuildPlugin(
  (userOptions = {}, metaOptions) => {
    const options = { ...userOptions };
    if (options.dev == null) options.dev = true;
    if (options.runtimeInjection == null) options.runtimeInjection = false;
    if (options.useCSSLayers == null) options.useCSSLayers = true;

    const plugin = unpluginFactory(options, metaOptions);
    const cssOutput =
      options.bunDevCssOutput ||
      path.resolve(process.cwd(), 'dist', 'stylex.dev.css');
    let lastCss = null;

    const writeCss = async () => {
      const css = plugin.__stylexCollectCss?.() || '';
      const next = css
        ? `:root { --stylex-injection: 0; }\n${css}`
        : ':root { --stylex-injection: 0; }';
      if (next === lastCss) return;
      lastCss = next;
      try {
        await fsp.mkdir(path.dirname(cssOutput), { recursive: true });
        await fsp.writeFile(cssOutput, next, 'utf8');
      } catch {}
    };

    return {
      ...plugin,
      async buildStart() {
        if (plugin.buildStart) await plugin.buildStart.call(this);
        await writeCss();
      },
      async buildEnd() {
        if (plugin.buildEnd) await plugin.buildEnd.call(this);
        await writeCss();
      },
      async transform(code, id) {
        const result = plugin.transform
          ? await plugin.transform.call(this, code, id)
          : null;
        await writeCss();
        return result;
      },
      async writeBundle(...args) {
        if (plugin.writeBundle) {
          await plugin.writeBundle.apply(this, args);
        }
        await writeCss();
      },
    };
  },
);

export default function stylexBunPlugin(userOptions = {}) {
  return bunPluginFactory(userOptions);
}
