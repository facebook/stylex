/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Enforces the load-bearing architectural invariants from commit one:
 *
 *  1. `src/core/` never imports from `src/adapters/` — the neutral-IR seam.
 *     The day core needs an adapter, the seam has leaked; that is a
 *     regression, not a refactor.
 *  2. Only `src/core/rewriter.js` may import the AST toolkit (jscodeshift),
 *     so the toolkit stays swappable behind one wrapper.
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC = path.join(__dirname, '..', 'src');

function jsFilesUnder(dir: string): Array<string> {
  const out: Array<string> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // String(): Flow's Dirent libdef types `name` as string | Buffer.
    const name = String(entry.name);
    const full = path.join(dir, name);
    if (entry.isDirectory()) {
      out.push(...jsFilesUnder(full));
    } else if (name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function importSpecifiers(source: string): Array<string> {
  const specifiers = [];
  const pattern = /(?:from\s+|require\(\s*|import\(\s*)['"]([^'"]+)['"]/g;
  for (;;) {
    const match = pattern.exec(source);
    if (match == null) {
      break;
    }
    specifiers.push(match[1]);
  }
  return specifiers;
}

test('src/core/ never imports from src/adapters/', () => {
  for (const file of jsFilesUnder(path.join(SRC, 'core'))) {
    for (const spec of importSpecifiers(fs.readFileSync(file, 'utf8'))) {
      expect({ file: path.relative(SRC, file), imports: spec }).not.toEqual(
        expect.objectContaining({
          imports: expect.stringMatching(/adapters/),
        }),
      );
    }
  }
});

test('only core/rewriter.js imports the AST toolkit', () => {
  for (const file of jsFilesUnder(SRC)) {
    if (path.relative(SRC, file) === path.join('core', 'rewriter.js')) {
      continue;
    }
    for (const spec of importSpecifiers(fs.readFileSync(file, 'utf8'))) {
      expect({ file: path.relative(SRC, file), imports: spec }).not.toEqual(
        expect.objectContaining({
          imports: expect.stringMatching(/^(jscodeshift|recast)/),
        }),
      );
    }
  }
});
