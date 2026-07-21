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
 *      (Emotion's own serializer vs the babel-plugin metadata, minus the
 *      sanctioned allowlist). Skip-fixtures (expected === input) assert
 *      that the transform really did refuse.
 *
 * Set UPDATE_STYLEX_CODEMOD_FIXTURES=1 to regenerate expected files when a
 * change is intentional.
 */

import * as fs from 'fs';
import { serializeStyles } from '@emotion/serialize';
import { compileGate } from '../src/core/gates/compile';
import { lintGate } from '../src/core/gates/lint';
import {
  semanticDiffGate,
  netCssFromSerializedCss,
  netCssFromStylexMetadata,
  keyframesFromStylexMetadata,
  parseFrames,
} from '../src/core/gates/semanticDiff';
import { transformEmotionFile } from '../src/adapters/emotion/transform';
import { loadFixtures, formatWithPrettier } from './utils/harness';

const UPDATE = process.env.UPDATE_STYLEX_CODEMOD_FIXTURES === '1';

/** Deterministic JSON with recursively-sorted keys, for set comparison. */
function canonicalJson(value: mixed): string {
  if (value == null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const obj: { +[string]: mixed } = value;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`)
    .join(',')}}`;
}

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
    const result = transformEmotionFile(fixture.input, fixture.inputPath);
    const output = result.status === 'converted' ? result.code : fixture.input;

    // Check 1 — byte-exact against expected, formatting-insensitive.
    test('transform(input) matches expected byte-exactly', () => {
      const actual = formatWithPrettier(output, fixture.expectedPath);
      if (UPDATE) {
        fs.writeFileSync(fixture.expectedPath, actual);
      }
      expect(actual).toEqual(
        formatWithPrettier(fixture.expected, fixture.expectedPath),
      );
    });

    // Check 2.
    test('expected compiles through @stylexjs/babel-plugin', () => {
      const compiled = compileGate(fixture.expected, {
        filename: fixture.expectedPath,
      });
      if (!compiled.ok) {
        throw new Error(compiled.errors.join('\n'));
      }
      expect(compiled.ok).toBe(true);
    });

    // Check 3.
    test('expected passes @stylexjs/eslint-plugin at error with zero messages', () => {
      const linted = lintGate(fixture.expected, {
        filename: fixture.expectedPath,
      });
      if (!linted.ok) {
        throw new Error(JSON.stringify(linted.messages, null, 2));
      }
      expect(linted.ok).toBe(true);
    });

    // Check 4.
    test('net CSS of input and expected is semantically identical', () => {
      if (result.status !== 'converted') {
        // A skip-fixture: the transform must have refused (loudly, with
        // reasons) and left the file byte-identical.
        expect(fixture.expected).toEqual(fixture.input);
        if (result.status === 'skipped') {
          expect(result.reasons.length).toBeGreaterThan(0);
        }
        return;
      }
      // Before: Emotion's own serializer over each converted object.
      // (Fixture-design constraint: sites must not restate the same
      // property+conditions with different values, or the union is lossy.)
      const before: { [string]: $FlowFixMe } = {};
      for (const site of result.sites) {
        const net = netCssFromSerializedCss(
          serializeStyles([site.cssObject]).styles,
        );
        for (const coordinate of Object.keys(net)) {
          if (
            before[coordinate] != null &&
            before[coordinate].value !== net[coordinate].value
          ) {
            throw new Error(
              `fixture restates '${coordinate}' with different values across sites`,
            );
          }
          before[coordinate] = net[coordinate];
        }
      }
      // After: the real babel-plugin metadata for the converted output.
      const compiled = compileGate(output, { filename: fixture.expectedPath });
      if (!compiled.ok) {
        throw new Error(compiled.errors.join('\n'));
      }
      const diff = semanticDiffGate(
        before,
        netCssFromStylexMetadata(compiled.metadata),
      );
      if (!diff.ok) {
        throw new Error(JSON.stringify(diff.diffs, null, 2));
      }
      expect(diff.ok).toBe(true);

      // Keyframes: the generated animation-name differs, so the frame
      // CONTENTS are compared directly (Emotion serializer vs StyleX
      // @keyframes metadata), as an order-independent multiset.
      const emotionFrames = result.keyframes
        .map((kf) => parseFrames(serializeStyles([kf.framesObject]).styles))
        .map(canonicalJson)
        .sort();
      const stylexFrames = keyframesFromStylexMetadata(compiled.metadata)
        .map(canonicalJson)
        .sort();
      expect(stylexFrames).toEqual(emotionFrames);
    });
  },
);
