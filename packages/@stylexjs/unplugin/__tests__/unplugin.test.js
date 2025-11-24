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
});
