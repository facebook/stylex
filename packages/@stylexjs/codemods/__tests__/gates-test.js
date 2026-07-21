/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Gate self-tests. A gate that never fails is worthless, so every gate is
 * proven BOTH ways: green on the trivial hand-written pair, and red on a
 * deliberately-broken input.
 */

import { serializeStyles } from '@emotion/serialize';
import { compileGate } from '../src/core/gates/compile';
import { lintGate } from '../src/core/gates/lint';
import {
  semanticDiffGate,
  netCssFromSerializedCss,
  netCssFromStylexMetadata,
  UnsupportedCssError,
} from '../src/core/gates/semanticDiff';
import { loadFixtures, readBrokenFixture } from './utils/harness';

const [trivialPair] = loadFixtures('emotion').filter(
  (f) => f.name === 'static-flat-color',
);

// The style object literally present in the trivial pair's input.js.
const trivialEmotionObject = { color: 'red' };

function emotionNetCss(styleObject: mixed) {
  return netCssFromSerializedCss(serializeStyles([styleObject]).styles);
}

describe('compile gate', () => {
  test('passes on the trivial expected output', () => {
    const result = compileGate(trivialPair.expected, {
      filename: trivialPair.expectedPath,
    });
    expect(result.ok).toBe(true);
  });

  test('FAILS on the deliberately-broken pair (non-static create arg)', () => {
    const result = compileGate(readBrokenFixture('compile-invalid.js'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join('\n')).toMatch(/create\(\)/);
    }
  });
});

describe('lint gate', () => {
  test('passes on the trivial expected output', () => {
    const result = lintGate(trivialPair.expected, {
      filename: trivialPair.expectedPath,
    });
    expect(result).toEqual({ ok: true });
  });

  test('FAILS on the deliberately-broken pair (invalid property, unused styles)', () => {
    const result = lintGate(readBrokenFixture('lint-invalid.js'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const ruleIds = result.messages.map((m) => m.ruleId);
      expect(ruleIds).toContain('@stylexjs/valid-styles');
      expect(ruleIds).toContain('@stylexjs/no-unused');
    }
  });
});

describe('semantic-diff gate', () => {
  test('trivial pair end-to-end: Emotion input and compiled StyleX output have equal net CSS', () => {
    const compiled = compileGate(trivialPair.expected, {
      filename: trivialPair.expectedPath,
    });
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) {
      return;
    }
    const before = emotionNetCss(trivialEmotionObject);
    const after = netCssFromStylexMetadata(compiled.metadata);
    const result = semanticDiffGate(before, after);
    expect(result.ok).toBe(true);
  });

  test('FAILS end-to-end when the output renders a different value', () => {
    const wrongExpected = trivialPair.expected.replace("'red'", "'blue'");
    const compiled = compileGate(wrongExpected);
    expect(compiled.ok).toBe(true);
    if (!compiled.ok) {
      return;
    }
    const result = semanticDiffGate(
      emotionNetCss(trivialEmotionObject),
      netCssFromStylexMetadata(compiled.metadata),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diffs).toEqual([
        expect.objectContaining({
          property: 'color',
          beforeValue: 'red',
          afterValue: 'blue',
        }),
      ]);
    }
  });

  test('FAILS when a declaration is dropped entirely', () => {
    const result = semanticDiffGate(
      emotionNetCss({ color: 'red', fontSize: 16 }),
      emotionNetCss({ color: 'red' }),
    );
    expect(result.ok).toBe(false);
  });

  test('parses nested pseudo-class and media conditions', () => {
    const net = emotionNetCss({
      color: 'red',
      ':hover': { color: 'blue' },
      '@media (min-width: 600px)': { color: 'green' },
    });
    expect(Object.keys(net).sort()).toEqual([
      'color',
      'color @ :hover',
      'color @ @media(min-width:600px)',
    ]);
  });

  test('allowlist: the hover-guard is a sanctioned diff', () => {
    const before = emotionNetCss({ ':hover': { color: 'blue' } });
    const after = emotionNetCss({
      '@media (hover: hover)': { ':hover': { color: 'blue' } },
    });
    const result = semanticDiffGate(before, after);
    expect(result.ok).toBe(true);
    expect(result.allowed.length).toBeGreaterThan(0);
  });

  test('allowlist: physical -> logical is a sanctioned diff (inset, not canonicalized)', () => {
    // margin/padding are canonicalized to physical longhands and match
    // directly; left/right (inset) still flow through the allowlist.
    const result = semanticDiffGate(
      emotionNetCss({ left: '0px' }),
      emotionNetCss({ insetInlineStart: '0px' }),
    );
    expect(result.ok).toBe(true);
    expect(result.allowed.length).toBeGreaterThan(0);
  });

  test('box shorthand and its expanded longhands compare equal', () => {
    // Emotion `margin: 8px 16px` vs the codemod's logical expansion.
    const result = semanticDiffGate(
      emotionNetCss({ margin: '8px 16px' }),
      emotionNetCss({ marginBlock: '8px', marginInline: '16px' }),
    );
    expect(result.ok).toBe(true);
  });

  test('shorthand canonicalization still catches a real per-side difference', () => {
    const result = semanticDiffGate(
      emotionNetCss({ margin: '8px 16px' }),
      emotionNetCss({ marginBlock: '8px', marginInline: '99px' }),
    );
    expect(result.ok).toBe(false);
  });

  test('allowlist does NOT excuse a value change under the same disguise', () => {
    const result = semanticDiffGate(
      emotionNetCss({ marginLeft: '8px' }),
      emotionNetCss({ marginInlineStart: '9px' }),
    );
    expect(result.ok).toBe(false);
  });

  test('BAILS LOUDLY on selectors that reach outside the element', () => {
    expect(() => emotionNetCss({ '& > span': { color: 'red' } })).toThrow(
      UnsupportedCssError,
    );
    expect(() => emotionNetCss({ 'div span': { color: 'red' } })).toThrow(
      UnsupportedCssError,
    );
  });

  test('BAILS LOUDLY on unrecognized StyleX metadata', () => {
    expect(() => netCssFromStylexMetadata({ nope: true })).toThrow(
      UnsupportedCssError,
    );
  });
});
