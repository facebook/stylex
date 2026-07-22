/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L0 driver core — the testable engine behind the CLI. Expands the glob(s),
 * runs the Emotion transform on each file, and returns a structured report.
 * Writes files only when `write` is true; the CLI defaults to a dry run.
 */

import * as fs from 'fs';
// $FlowFixMe[cannot-resolve-module] - fast-glob has no flow libdef here
import fastGlob from 'fast-glob';
import { transformEmotionFile } from '../adapters/emotion/transform';
import type { CodemodConfig } from '../config/loadConfig';

export type FileOutcome = {
  +file: string,
  +status: 'converted' | 'skipped' | 'unchanged' | 'error',
  +flags: $ReadOnlyArray<string>, // per-site TODO reasons (converted)
  +reasons: $ReadOnlyArray<string>, // whole-file refusal reasons (skipped)
  +wrote: boolean,
};

export type RunSummary = {
  +files: number,
  +converted: number, // fully converted (no flags)
  +partiallyConverted: number, // converted with ≥1 flag
  +skipped: number,
  +unchanged: number,
  +errors: number,
  +totalFlags: number,
};

export type RunReport = {
  +dryRun: boolean,
  +results: $ReadOnlyArray<FileOutcome>,
  +summary: RunSummary,
};

export type RunOptions = {
  +patterns: $ReadOnlyArray<string>,
  +config: CodemodConfig,
  +cwd?: string,
  +write?: boolean,
};

export function runCodemod(options: RunOptions): RunReport {
  const cwd = options.cwd ?? process.cwd();
  const write = options.write ?? false;
  const files: Array<string> = fastGlob.sync(options.patterns.slice(), {
    cwd,
    absolute: true,
    ignore: ['**/node_modules/**'],
  });

  const results: Array<FileOutcome> = files.map((file) => {
    let source: string;
    try {
      source = fs.readFileSync(file, 'utf8');
    } catch (error) {
      return errorOutcome(file, error);
    }
    let result;
    try {
      result = transformEmotionFile(source, file, options.config);
    } catch (error) {
      return errorOutcome(file, error);
    }
    if (result.status === 'converted') {
      let wrote = false;
      if (write) {
        try {
          fs.writeFileSync(file, result.code);
          wrote = true;
        } catch (error) {
          return errorOutcome(file, error);
        }
      }
      return {
        file,
        status: 'converted',
        flags: result.flags,
        reasons: [],
        wrote,
      };
    }
    if (result.status === 'skipped') {
      return {
        file,
        status: 'skipped',
        flags: [],
        reasons: result.reasons,
        wrote: false,
      };
    }
    return { file, status: 'unchanged', flags: [], reasons: [], wrote: false };
  });

  return { dryRun: !write, results, summary: summarize(results) };
}

function errorOutcome(file: string, error: mixed): FileOutcome {
  return {
    file,
    status: 'error',
    flags: [],
    reasons: [error instanceof Error ? error.message : String(error)],
    wrote: false,
  };
}

function summarize(results: $ReadOnlyArray<FileOutcome>): RunSummary {
  const summary = {
    files: results.length,
    converted: 0,
    partiallyConverted: 0,
    skipped: 0,
    unchanged: 0,
    errors: 0,
    totalFlags: 0,
  };
  for (const r of results) {
    summary.totalFlags += r.flags.length;
    switch (r.status) {
      case 'converted':
        if (r.flags.length > 0) {
          summary.partiallyConverted += 1;
        } else {
          summary.converted += 1;
        }
        break;
      case 'skipped':
        summary.skipped += 1;
        break;
      case 'unchanged':
        summary.unchanged += 1;
        break;
      case 'error':
        summary.errors += 1;
        break;
      default:
        break;
    }
  }
  return summary;
}
