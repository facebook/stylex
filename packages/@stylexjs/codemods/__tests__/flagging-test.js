/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * M5 per-site flagging: convert what is safe, leave a `// TODO` marker on the
 * rest, and never silently drop or re-flag.
 */

import { transformEmotionFile } from '../src/adapters/emotion/transform';

const HEADER =
  '/** @jsxImportSource @emotion/react */\n' +
  "import * as React from 'react';\n";

test('a flag marker is not duplicated on a second run (re-run guard)', () => {
  const input =
    HEADER +
    'export default function C() {\n' +
    '  return (\n' +
    '    <div>\n' +
    '      <button css={{ color: fn() }}>x</button>\n' +
    '    </div>\n' +
    '  );\n' +
    '}\n';
  const first = transformEmotionFile(input, 'in.js');
  expect(first.status).toBe('converted');
  if (first.status !== 'converted') {
    return;
  }
  expect(first.flags.length).toBe(1);
  const markerCount = (s: string) =>
    (s.match(/TODO\(stylex-migration\)/g) ?? []).length;
  expect(markerCount(first.code)).toBe(1);

  // Running again on the already-flagged output must not add a second marker.
  const second = transformEmotionFile(first.code, 'in.js');
  if (second.status === 'converted') {
    expect(markerCount(second.code)).toBe(1);
  } else {
    // 'unchanged' is also acceptable (nothing left to do).
    expect(second.status).toBe('unchanged');
  }
});

test('a whole-file structural issue still refuses (does not flag)', () => {
  // Non-namespace stylex import can't be merged into — whole-file refusal.
  const input = [
    '/** @jsxImportSource @emotion/react */',
    "import * as React from 'react';",
    "import { create } from '@stylexjs/stylex';",
    "const s = create({ a: { color: 'red' } });",
    'export default function C() {',
    "  return <span css={{ color: 'gray' }}>{s ? 'x' : 'y'}</span>;",
    '}',
    '',
  ].join('\n');
  const result = transformEmotionFile(input, 'in.js');
  expect(result.status).toBe('skipped');
  if (result.status === 'skipped') {
    expect(result.reasons.join('\n')).toMatch(/namespace/);
  }
});

test('a fully-convertible file reports no flags', () => {
  const input =
    HEADER +
    'export default function C() {\n' +
    "  return <span css={{ color: 'gray' }}>x</span>;\n" +
    '}\n';
  const result = transformEmotionFile(input, 'in.js');
  expect(result.status).toBe('converted');
  if (result.status === 'converted') {
    expect(result.flags).toEqual([]);
  }
});
