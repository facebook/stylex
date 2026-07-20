/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * IR-completeness harness.
 *
 * Completeness is MEASURED, not asserted: every valid StyleX style object
 * in the corpus is read into the IR, re-emitted, compiled through the real
 * babel-plugin, and required to be semantically identical to the original
 * (empty allowlist — same object, so zero sanctioned drift). Whatever the
 * reader cannot represent is a concrete, SAFE coverage gap (in the real
 * pipeline it would be flagged, never emitted incorrectly).
 *
 * M1+: grow the corpus toward extraction from StyleX's own valid fixtures
 * (`@stylexjs/babel-plugin` / `@stylexjs/eslint-plugin` tests).
 */

import {
  stylexObjectToIR,
  IRCoverageGapError,
} from '../src/testing/stylexToIR';
import { emitFileIR } from '../src/core/emit';
import type { EmittedStyle, EmittedValue } from '../src/core/emit';
import { compileGate } from '../src/core/gates/compile';
import {
  semanticDiffGate,
  netCssFromStylexMetadata,
} from '../src/core/gates/semanticDiff';

const SEED_CORPUS: $ReadOnlyArray<[string, mixed]> = [
  ['flat static styles', { color: 'red', fontSize: 16 }],
  [
    'pseudo-class conditions in the value object',
    { color: { default: 'black', ':hover': 'blue' } },
  ],
  // Valid modern StyleX — pseudo-elements may appear inside value objects.
  [
    'pseudo-element condition in the value object',
    { color: { default: 'black', '::placeholder': 'gray' } },
  ],
  [
    'at-rule conditions',
    { width: { default: '100%', '@media (min-width: 600px)': '50%' } },
  ],
  ['fallback array (firstThatWorks)', { position: ['sticky', 'fixed'] }],
];

function valueToSource(value: EmittedValue | mixed): string {
  if (typeof value === 'string') {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(valueToSource).join(', ')}]`;
  }
  throw new Error(`unstringifiable value: ${String(value)}`);
}

function styleToSource(style: EmittedStyle | mixed): string {
  if (style == null || typeof style !== 'object') {
    throw new Error('unstringifiable style object');
  }
  const entries = Object.keys(style).map(
    (property) => `${property}: ${valueToSource(style[property])}`,
  );
  return `{ ${entries.join(', ')} }`;
}

function netCssOfStyleObject(style: EmittedStyle | mixed) {
  const source = [
    "import * as stylex from '@stylexjs/stylex';",
    `export const styles = stylex.create({ k: ${styleToSource(style)} });`,
    '',
  ].join('\n');
  const compiled = compileGate(source);
  if (!compiled.ok) {
    throw new Error(
      `corpus entry does not compile:\n${compiled.errors.join('\n')}`,
    );
  }
  return netCssFromStylexMetadata(compiled.metadata);
}

test('every corpus entry round-trips through the IR or is a typed coverage gap', () => {
  const covered: Array<string> = [];
  const gaps: Array<string> = [];
  for (const [name, styleObject] of SEED_CORPUS) {
    let rule;
    try {
      rule = stylexObjectToIR(name, styleObject);
    } catch (error) {
      if (!(error instanceof IRCoverageGapError)) {
        throw error; // a real bug, not a coverage gap
      }
      gaps.push(name);
      continue;
    }
    // Round-trip: IR -> emit -> compile, and compare against the original
    // object compiled directly. Empty allowlist: any drift is a failure.
    const { rules } = emitFileIR({ rules: [rule], keyframes: [] });
    const diff = semanticDiffGate(
      netCssOfStyleObject(styleObject),
      netCssOfStyleObject(rules[0].style),
      { allowlist: [] },
    );
    if (!diff.ok) {
      throw new Error(
        `round-trip drift for '${name}': ${JSON.stringify(diff.diffs)}`,
      );
    }
    covered.push(name);
  }
  expect(covered.length + gaps.length).toBe(SEED_CORPUS.length);
  expect(covered).toEqual([
    'flat static styles',
    'fallback array (firstThatWorks)',
  ]);
  // eslint-disable-next-line no-console
  console.info(
    `[ir-completeness] ${covered.length}/${SEED_CORPUS.length} corpus entries covered` +
      (gaps.length > 0 ? ` — gaps: ${gaps.join(', ')}` : ''),
  );
});
