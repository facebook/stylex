/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadConfig,
  validateConfig,
  DEFAULT_CONFIG,
  ConfigError,
} from '../src/config/loadConfig';
import { runCodemod } from '../src/cli/run';
import { formatReport } from '../src/cli/report';

const CONVERTIBLE =
  '/** @jsxImportSource @emotion/react */\n' +
  "import * as React from 'react';\n" +
  'export default function A() {\n' +
  "  return <div css={{ color: 'red' }}>A</div>;\n" +
  '}\n';

const FLAGGED =
  '/** @jsxImportSource @emotion/react */\n' +
  "import * as React from 'react';\n" +
  'export default function B() {\n' +
  '  return <span css={{ color: fn() }}>B</span>;\n' +
  '}\n';

const REFUSED =
  '/** @jsxImportSource @emotion/react */\n' +
  "import * as React from 'react';\n" +
  "import { create } from '@stylexjs/stylex';\n" +
  "const s = create({ a: { color: 'red' } });\n" +
  'export default function C() {\n' +
  "  return <span css={{ color: 'gray' }}>{s ? 'x' : 'y'}</span>;\n" +
  '}\n';

const PLAIN = 'export default function D() {\n  return null;\n}\n';

function makeProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-codemod-'));
  fs.writeFileSync(path.join(dir, 'convert.jsx'), CONVERTIBLE);
  fs.writeFileSync(path.join(dir, 'flag.jsx'), FLAGGED);
  fs.writeFileSync(path.join(dir, 'refuse.jsx'), REFUSED);
  fs.writeFileSync(path.join(dir, 'plain.jsx'), PLAIN);
  return dir;
}

describe('loadConfig', () => {
  test('missing config falls back to defaults', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-cfg-'));
    expect(loadConfig({ cwd: dir })).toEqual(DEFAULT_CONFIG);
  });

  test('an explicit missing config path throws', () => {
    expect(() => loadConfig({ configPath: '/nope/x.js' })).toThrow(ConfigError);
  });

  test('validates and merges over defaults', () => {
    expect(validateConfig({ hoverGuard: false }, 'x')).toEqual({
      hoverGuard: false,
      logicalProperties: true,
    });
  });

  test('unknown option throws', () => {
    expect(() => validateConfig({ nope: true }, 'x')).toThrow(/unknown option/);
  });

  test('non-boolean option throws', () => {
    expect(() => validateConfig({ hoverGuard: 'yes' }, 'x')).toThrow(
      /must be a boolean/,
    );
  });
});

describe('runCodemod (dry run is the default)', () => {
  test('reports convert / flag / refuse / unchanged without writing', () => {
    const dir = makeProject();
    const before = fs.readFileSync(path.join(dir, 'convert.jsx'), 'utf8');
    const report = runCodemod({
      patterns: ['*.jsx'],
      cwd: dir,
      config: DEFAULT_CONFIG,
      write: false,
    });
    expect(report.dryRun).toBe(true);
    expect(report.summary).toMatchObject({
      files: 4,
      converted: 1, // convert.jsx (no flags)
      partiallyConverted: 1, // flag.jsx (a TODO)
      skipped: 1, // refuse.jsx
      unchanged: 1, // plain.jsx
    });
    expect(report.summary.totalFlags).toBe(1);
    // Dry run wrote nothing.
    expect(fs.readFileSync(path.join(dir, 'convert.jsx'), 'utf8')).toEqual(
      before,
    );
    expect(report.results.every((r) => r.wrote === false)).toBe(true);
  });

  test('--write applies the conversion to disk', () => {
    const dir = makeProject();
    runCodemod({
      patterns: ['convert.jsx'],
      cwd: dir,
      config: DEFAULT_CONFIG,
      write: true,
    });
    const after = fs.readFileSync(path.join(dir, 'convert.jsx'), 'utf8');
    expect(after).toContain('stylex.props(styles.a)');
    expect(after).not.toContain('css={{');
  });

  test('logicalProperties: false is threaded through', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stylex-opt-'));
    fs.writeFileSync(
      path.join(dir, 'a.jsx'),
      '/** @jsxImportSource @emotion/react */\n' +
        "import * as React from 'react';\n" +
        'export default function A() {\n' +
        '  return <div css={{ marginLeft: 8 }}>A</div>;\n' +
        '}\n',
    );
    runCodemod({
      patterns: ['a.jsx'],
      cwd: dir,
      config: { hoverGuard: true, logicalProperties: false },
      write: true,
    });
    const after = fs.readFileSync(path.join(dir, 'a.jsx'), 'utf8');
    expect(after).toContain('marginLeft'); // NOT converted to marginInlineStart
  });
});

describe('formatReport', () => {
  test('renders a preview with a summary and an apply hint', () => {
    const dir = makeProject();
    const report = runCodemod({
      patterns: ['*.jsx'],
      cwd: dir,
      config: DEFAULT_CONFIG,
      write: false,
    });
    const text = formatReport(report, { cwd: dir });
    expect(text).toContain('Dry run');
    expect(text).toMatch(/convert\.jsx/);
    expect(text).toMatch(/\+1 TODO/); // flag.jsx marker count
    expect(text).toMatch(/refuse\.jsx/);
    expect(text).toContain('Re-run with --write to apply.');
    // unchanged file hidden unless verbose
    expect(text).not.toMatch(/plain\.jsx/);
  });
});
