/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('node:path');

function normalizeSpecifier(spec) {
  // Drop URL query/hash e.g. './foo?raw#hash'
  const q = spec.indexOf('?');
  const h = spec.indexOf('#');
  const cut = Math.min(q === -1 ? spec.length : q, h === -1 ? spec.length : h);
  return { base: spec.slice(0, cut), suffix: spec.slice(cut) };
}

function needsExtension(spec) {
  if (!spec) return false;
  if (!(spec.startsWith('./') || spec.startsWith('../'))) return false;
  const { base } = normalizeSpecifier(spec);
  const ext = path.extname(base);
  return ext === '';
}

module.exports = function addMjsExtension({ types: t }) {
  return {
    name: 'add-mjs-extension',
    visitor: {
      ImportDeclaration(path, state) {
        const ext = state.opts?.extension || '.mjs';
        const s = path.node.source && path.node.source.value;
        if (!s) return;
        if (needsExtension(s)) {
          const { base, suffix } = normalizeSpecifier(s);
          path.node.source = t.stringLiteral(base + ext + suffix);
        }
      },
      ExportNamedDeclaration(path, state) {
        const ext = state.opts?.extension || '.mjs';
        const s = path.node.source && path.node.source.value;
        if (!s) return;
        if (needsExtension(s)) {
          const { base, suffix } = normalizeSpecifier(s);
          path.node.source = t.stringLiteral(base + ext + suffix);
        }
      },
    },
  };
};
