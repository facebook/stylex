/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * The fixture harness — the executable spec. Every input/expected pair
 * under `__fixtures__/emotion/` must satisfy four checks:
 *
 *   1. transform(input) matches expected byte-exactly (after Prettier);
 *   2. expected compiles through @stylexjs/babel-plugin;
 *   3. expected passes @stylexjs/eslint-plugin at error, zero messages;
 *   4. the net CSS of input and expected is semantically identical
 *      (minus the sanctioned allowlist).
 *
 * Set UPDATE_STYLEX_CODEMOD_FIXTURES=1 to regenerate expected files when a
 * change is intentional.
 *
 * M0 status: no transform exists yet, so checks 1 and 4 (which need the
 * transform / the adapter's reader) are pending and explicitly skipped;
 * checks 2 and 3 run for real. M1 wires `transform` below and un-skips.
 */

import * as fs from 'fs';
import { compileGate } from '../src/core/gates/compile';
import { lintGate } from '../src/core/gates/lint';
import { loadFixtures, formatWithPrettier } from './utils/harness';

// M1: replace with the real emotion transform (input source -> output source).
const transform: ((source: string, filename: string) => string) | null = null;

const UPDATE = process.env.UPDATE_STYLEX_CODEMOD_FIXTURES === '1';

const fixtures = loadFixtures('emotion');

test('there is at least one fixture pair', () => {
  expect(fixtures.length).toBeGreaterThan(0);
});

test('prettier normalization is available and idempotent', () => {
  const [fixture] = fixtures;
  const once = formatWithPrettier(fixture.expected, fixture.expectedPath);
  expect(formatWithPrettier(once, fixture.expectedPath)).toEqual(once);
});

describe.each(fixtures.map((f) => [f.name, f]))(
  'fixture: %s',
  (_name, fixture) => {
    const testIfTransform = transform == null ? test.skip : test;

    // Check 1 — pending M1 (needs the transform).
    testIfTransform('transform(input) matches expected byte-exactly', () => {
      if (transform == null) {
        throw new Error('unreachable');
      }
      const actual = formatWithPrettier(
        transform(fixture.input, fixture.inputPath),
        fixture.expectedPath,
      );
      if (UPDATE) {
        fs.writeFileSync(fixture.expectedPath, actual);
      }
      expect(actual).toEqual(
        formatWithPrettier(fixture.expected, fixture.expectedPath),
      );
    });

    // Check 2 — live from M0.
    test('expected compiles through @stylexjs/babel-plugin', () => {
      const result = compileGate(fixture.expected, {
        filename: fixture.expectedPath,
      });
      if (!result.ok) {
        throw new Error(result.errors.join('\n'));
      }
      expect(result.ok).toBe(true);
    });

    // Check 3 — live from M0.
    test('expected passes @stylexjs/eslint-plugin at error with zero messages', () => {
      const result = lintGate(fixture.expected, {
        filename: fixture.expectedPath,
      });
      if (!result.ok) {
        throw new Error(JSON.stringify(result.messages, null, 2));
      }
      expect(result.ok).toBe(true);
    });

    // Check 4 — pending M1 (extracting the input's style objects is the
    // adapter reader's job; the gate itself is proven in gates-test.js).
    testIfTransform(
      'net CSS of input and expected is semantically identical',
      () => {
        throw new Error('wired in M1 with the emotion adapter reader');
      },
    );
  },
);
