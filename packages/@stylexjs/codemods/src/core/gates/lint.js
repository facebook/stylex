/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Lint gate: the output of a conversion must pass every rule of the real
 * `@stylexjs/eslint-plugin` at severity `error`, with zero messages —
 * which implies zero autofixes still needed (Meta's golden rule for
 * StyleX codemods).
 */

import { Linter } from 'eslint';
// hermes-eslint is ESM-compiled with no default export — the namespace
// object itself is the parser (`parseForESLint` lives on it).
import * as hermesEslint from 'hermes-eslint';
// The plugin has named exports only (no default) — import `rules` directly.
import { rules as stylexRules } from '@stylexjs/eslint-plugin';

export type LintMessage = {
  +ruleId: string | null,
  +message: string,
  +line: number,
  +column: number,
  +fixable: boolean,
};

export type LintGateResult =
  | { +ok: true }
  | { +ok: false, +messages: $ReadOnlyArray<LintMessage> };

const PARSER_NAME = 'hermes-eslint';

function buildLinter(): { linter: Linter, rules: { [string]: 'error' } } {
  const linter = new Linter();
  linter.defineParser(PARSER_NAME, hermesEslint);
  const ruleMap: { +[string]: mixed } = stylexRules;
  const rules: { [string]: 'error' } = {};
  for (const ruleName of Object.keys(ruleMap)) {
    const qualified = `@stylexjs/${ruleName}`;
    linter.defineRule(qualified, ruleMap[ruleName]);
    rules[qualified] = 'error';
  }
  return { linter, rules };
}

export function lintGate(
  source: string,
  options?: { +filename?: string },
): LintGateResult {
  const { linter, rules } = buildLinter();
  const messages = linter.verify(
    source,
    {
      parser: PARSER_NAME,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules,
    },
    { filename: options?.filename ?? 'stylex-codemod-gate-input.js' },
  );
  if (messages.length === 0) {
    return { ok: true };
  }
  return {
    ok: false,
    messages: messages.map((m) => ({
      ruleId: m.ruleId ?? null,
      message: m.message,
      line: m.line ?? 0,
      column: m.column ?? 0,
      fixable: m.fix != null,
    })),
  };
}
