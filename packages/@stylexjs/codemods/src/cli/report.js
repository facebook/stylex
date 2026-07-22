/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L13 report — renders a RunReport as human-readable text. Kept separate from
 * `run` so the report can be asserted on the structured data in tests and the
 * text formatting stays presentation-only.
 */

import * as path from 'path';
import type { RunReport, FileOutcome } from './run';

function relativize(file: string, cwd: string): string {
  const rel = path.relative(cwd, file);
  return rel === '' || rel.startsWith('..') ? file : rel;
}

function outcomeLine(outcome: FileOutcome, cwd: string): string {
  const file = relativize(outcome.file, cwd);
  if (outcome.status === 'converted') {
    const suffix =
      outcome.flags.length > 0
        ? ` (+${outcome.flags.length} TODO${outcome.flags.length === 1 ? '' : 's'})`
        : '';
    return `  convert  ${file}${suffix}`;
  }
  if (outcome.status === 'unchanged') {
    return `  skip     ${file}`;
  }
  const detail = outcome.reasons[0] != null ? ` — ${outcome.reasons[0]}` : '';
  const label = outcome.status === 'error' ? 'ERROR  ' : 'refuse ';
  return `  ${label} ${file}${detail}`;
}

export function formatReport(
  report: RunReport,
  options?: { +cwd?: string, +verbose?: boolean },
): string {
  const cwd = options?.cwd ?? process.cwd();
  const verbose = options?.verbose ?? false;
  const lines: Array<string> = [];

  lines.push(report.dryRun ? 'Dry run (no files written):' : 'Applied:');
  for (const outcome of report.results) {
    if (outcome.status === 'unchanged' && !verbose) {
      continue; // unchanged files are noise unless asked for
    }
    lines.push(outcomeLine(outcome, cwd));
    if (verbose) {
      for (const flag of outcome.flags) {
        lines.push(`             TODO: ${flag}`);
      }
    }
  }

  const s = report.summary;
  lines.push('');
  lines.push(
    `${s.files} file(s): ${s.converted} converted, ` +
      `${s.partiallyConverted} partial (+TODOs), ${s.skipped} refused, ` +
      `${s.unchanged} unchanged` +
      (s.errors > 0 ? `, ${s.errors} error(s)` : ''),
  );
  if (s.totalFlags > 0) {
    lines.push(`${s.totalFlags} TODO marker(s) left for manual follow-up.`);
  }
  if (report.dryRun && (s.converted > 0 || s.partiallyConverted > 0)) {
    lines.push('Re-run with --write to apply.');
  }
  return lines.join('\n');
}
