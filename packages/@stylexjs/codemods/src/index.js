/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * @stylexjs/codemods — migrate styling libraries to StyleX.
 *
 * M0: gated harness only. The public surface is the IR types and the three
 * correctness gates; transforms land from M1.
 */

export type {
  Atom,
  Condition,
  Value,
  StyleRule,
  KeyframesRule,
  FileIR,
} from './core/ir';
export { conditionKey, atomCoordinate } from './core/ir';

export { compileGate } from './core/gates/compile';
export { lintGate } from './core/gates/lint';
export {
  semanticDiffGate,
  netCssFromSerializedCss,
  netCssFromStylexMetadata,
  DEFAULT_ALLOWLIST,
  UnsupportedCssError,
} from './core/gates/semanticDiff';

export { parseSource, printSource, parserForFile } from './core/rewriter';
