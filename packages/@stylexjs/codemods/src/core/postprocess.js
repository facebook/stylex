/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L10 — Postprocess. Runs StyleX's OWN eslint autofixes over the emitted
 * output, so the result passes `@stylexjs/eslint-plugin` at error with zero
 * autofixes remaining (Meta's golden rule) — and, crucially, so key
 * ordering and shorthand handling exactly match StyleX's canonical form
 * rather than a heuristic we maintain.
 *
 * M3: run file-wide. This is safe *now* because a converted file has no
 * pre-existing user `stylex.create` (files that do are refused upstream),
 * so the only nodes the autofix can touch are the ones we emitted. M4 adds
 * the scoping needed once we merge into a user's existing registry.
 *
 * The sort-keys autofix can reorder sibling media queries, which the StyleX
 * compiler treats as semantic — but the semantic-diff gate runs on this
 * function's OUTPUT, so any reorder that changes rendering is caught (the
 * file is refused) rather than shipped.
 *
 * Residual (unfixable) errors mean the output is not clean; the caller
 * refuses the whole file.
 */

import { Linter } from 'eslint';
import * as hermesEslint from 'hermes-eslint';
import { rules as stylexRules } from '@stylexjs/eslint-plugin';

export type PostprocessResult = {
  +code: string,
  +residualErrors: $ReadOnlyArray<string>,
};

const PARSER_NAME = 'hermes-eslint';

export function postprocess(
  code: string,
  filename: string = 'file.js',
): PostprocessResult {
  const linter = new Linter();
  linter.defineParser(PARSER_NAME, hermesEslint);
  const ruleMap: { +[string]: mixed } = stylexRules;
  const config: { [string]: 'error' } = {};
  for (const ruleName of Object.keys(ruleMap)) {
    const qualified = `@stylexjs/${ruleName}`;
    linter.defineRule(qualified, ruleMap[ruleName]);
    config[qualified] = 'error';
  }

  const verifyConfig = {
    parser: PARSER_NAME,
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: config,
  };
  const fixed = linter.verifyAndFix(code, verifyConfig, { filename });
  const residual = linter.verify(fixed.output, verifyConfig, { filename });

  return {
    code: fixed.output,
    residualErrors: residual.map(
      (m) => `${m.ruleId ?? 'error'}: ${m.message} (line ${m.line ?? 0})`,
    ),
  };
}
