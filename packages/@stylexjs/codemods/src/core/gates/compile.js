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
  // TypeScript files strip types via preset-typescript; everything else
  // (JS/JSX/Flow) parses through hermes so bare Flow annotations work without
  // a `@flow` pragma.
  const isTypeScript = /\.(ts|tsx|mts|cts)$/.test(filename);
  const presets = isTypeScript
    ? [['@babel/preset-typescript', { allExtensions: true, isTSX: true }]]
    : [];
  const syntaxPlugins = isTypeScript
    ? []
    : [['babel-plugin-syntax-hermes-parser', { flow: 'all' }]];
  try {
    const result = babel.transformSync(source, {
      filename,
      babelrc: false,
      configFile: false,
      presets,
      plugins: [...syntaxPlugins, [styleXPlugin, {}]],
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
