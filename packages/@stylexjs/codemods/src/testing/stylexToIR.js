/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * TEST-ONLY reader: a valid `stylex.create` style object -> IR.
 *
 * This powers the IR-completeness harness: round-tripping StyleX's own
 * valid-input corpus (read -> IR -> re-emit -> still compiles & semantically
 * identical) turns "is the IR complete?" from a claim into a measured
 * coverage percentage. An IR gap found here is SAFE — in the real pipeline
 * the same construct would be flagged, never emitted incorrectly.
 *
 * Not implemented until M1 (it needs the emitter to round-trip against);
 * the harness counts every corpus entry as uncovered until then.
 */

import type { StyleRule } from '../core/ir';

export class IRCoverageGapError extends Error {
  constructor(message: string) {
    super(`[stylex-codemod ir-completeness] ${message}`);
    this.name = 'IRCoverageGapError';
  }
}

// eslint-disable-next-line no-unused-vars
export function stylexObjectToIR(name: string, styleObject: mixed): StyleRule {
  throw new IRCoverageGapError(
    'stylexObjectToIR is not implemented yet (lands with the M1 emitter)',
  );
}
