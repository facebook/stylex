/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Proves the M4 scoping guarantee: the postprocess autofix runs only on the
 * codemod's OWN emitted stylex (a standalone snippet), never on the user's
 * pre-existing `stylex.create`. So a user's existing registry is either
 * preserved exactly (when clean) or the file is refused (when the user's own
 * code is lint-dirty) — never silently reordered.
 */

import { transformEmotionFile } from '../src/adapters/emotion/transform';

const HEADER =
  '/** @jsxImportSource @emotion/react */\n' +
  "import * as React from 'react';\n" +
  "import * as stylex from '@stylexjs/stylex';\n";

test('merge appends to a pre-existing registry and leaves the user entry untouched', () => {
  const input =
    HEADER +
    'const styles = stylex.create({\n' +
    "  card: { padding: '8px' },\n" +
    '});\n' +
    'export default function C() {\n' +
    "  return <div {...stylex.props(styles.card)}><span css={{ color: 'gray' }}>x</span></div>;\n" +
    '}\n';
  const result = transformEmotionFile(input, 'in.js');
  expect(result.status).toBe('converted');
  if (result.status === 'converted') {
    // The user's `card` entry survives verbatim; ours is appended (named `c`
    // after the enclosing component).
    expect(result.code).toMatch(/card:\s*{\s*padding: '8px'\s*}/);
    expect(result.code).toMatch(/stylex\.props\(styles\.c\)/);
    // No second registry / duplicate import.
    expect(result.code.match(/stylex\.create/g)).toHaveLength(1);
    expect(result.code.match(/@stylexjs\/stylex/g)).toHaveLength(1);
  }
});

test('a user registry with lint-dirty ordering is REFUSED, never silently reordered', () => {
  // The user's `card` object has unsorted keys (zIndex before color) — a
  // file-wide autofix would reorder them. Our scoped fix does not touch it,
  // so the final verify flags it and we refuse rather than rewrite user code.
  const input =
    HEADER +
    'const styles = stylex.create({\n' +
    "  card: { zIndex: 1, color: 'red' },\n" +
    '});\n' +
    'export default function C() {\n' +
    "  return <div {...stylex.props(styles.card)}><span css={{ color: 'gray' }}>x</span></div>;\n" +
    '}\n';
  const result = transformEmotionFile(input, 'in.js');
  expect(result.status).toBe('skipped');
  if (result.status === 'skipped') {
    expect(result.reasons.join('\n')).toMatch(/sort-keys/);
  }
});

test('keys collide-safely with the pre-existing registry (numeric suffix)', () => {
  // Our converted <div> would want the name `mixed`; the user already has it.
  const input =
    HEADER +
    'const styles = stylex.create({\n' +
    "  mixed: { padding: '8px' },\n" +
    '});\n' +
    'export default function Mixed() {\n' +
    "  return <div {...stylex.props(styles.mixed)}><span css={{ color: 'gray' }}>x</span></div>;\n" +
    '}\n';
  const result = transformEmotionFile(input, 'in.js');
  expect(result.status).toBe('converted');
  if (result.status === 'converted') {
    expect(result.code).toMatch(/mixed2:/); // suffixed to avoid collision
    expect(result.code).toMatch(/stylex\.props\(styles\.mixed2\)/);
  }
});
