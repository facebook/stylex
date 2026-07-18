/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * IR-completeness harness (M0 stub).
 *
 * Completeness is MEASURED, not asserted: every valid StyleX style object
 * in the corpus is read into the IR; whatever cannot be represented is a
 * concrete, safe coverage gap (in the real pipeline it would be flagged,
 * never emitted incorrectly). The reader lands with the M1 emitter — until then
 * every entry counts as uncovered and the reported coverage is 0%.
 *
 * M1+: replace the seed corpus with extraction from StyleX's own valid
 * fixtures (`@stylexjs/babel-plugin` / `@stylexjs/eslint-plugin` tests),
 * and round-trip each covered entry (IR -> emit -> compile + semantic-diff).
 */

import {
  stylexObjectToIR,
  IRCoverageGapError,
} from '../src/testing/stylexToIR';

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

test('every corpus entry is either covered by the IR or a typed coverage gap', () => {
  let covered = 0;
  const gaps: Array<string> = [];
  for (const [name, styleObject] of SEED_CORPUS) {
    try {
      stylexObjectToIR(name, styleObject);
      covered += 1;
    } catch (error) {
      if (!(error instanceof IRCoverageGapError)) {
        throw error; // a real bug, not a coverage gap
      }
      gaps.push(name);
    }
  }
  expect(covered + gaps.length).toBe(SEED_CORPUS.length);
  // eslint-disable-next-line no-console
  console.info(
    `[ir-completeness] ${covered}/${SEED_CORPUS.length} corpus entries covered` +
      (gaps.length > 0 ? ` — gaps: ${gaps.join(', ')}` : ''),
  );
});
