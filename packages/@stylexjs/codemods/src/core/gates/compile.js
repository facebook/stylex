/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Compile gate: the output of a conversion must compile through the real
 * `@stylexjs/babel-plugin`. On success it also returns the plugin's
 * metadata (the injectable CSS rules), which the semantic-diff gate uses
 * as the StyleX side's ground truth.
 */

import * as babel from '@babel/core';
import styleXPlugin from '@stylexjs/babel-plugin';

export type CompileGateResult =
  | { +ok: true, +code: string, +metadata: mixed }
  | { +ok: false, +errors: $ReadOnlyArray<string> };

export function compileGate(
  source: string,
  options?: { +filename?: string },
): CompileGateResult {
  const filename = options?.filename ?? 'stylex-codemod-gate-input.js';
  try {
    const result = babel.transformSync(source, {
      filename,
      babelrc: false,
      configFile: false,
      plugins: [
        ['babel-plugin-syntax-hermes-parser', { flow: 'detect' }],
        [styleXPlugin, {}],
      ],
    });
    if (result == null || result.code == null) {
      return { ok: false, errors: ['Babel produced no output'] };
    }
    return { ok: true, code: result.code, metadata: result.metadata };
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
