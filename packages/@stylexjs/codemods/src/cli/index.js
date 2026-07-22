#! /usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * L0 CLI — `stylex-codemod emotion "<glob>" [--write] [--config <path>]`.
 *
 * DRY RUN IS THE DEFAULT: with no `--write`, nothing is written; you get a
 * convert / refuse / TODO report to preview. `--write` applies the changes.
 */

import yargs from 'yargs';
// $FlowFixMe[cannot-resolve-module] - yargs/helpers has no flow libdef here
import { hideBin } from 'yargs/helpers';
import { loadConfig } from '../config/loadConfig';
import { runCodemod } from './run';
import { formatReport } from './report';

export function main(argv: $ReadOnlyArray<string>): number {
  const args = yargs([...argv])
    .scriptName('stylex-codemod')
    .usage('$0 <adapter> <glob..> [options]')
    .command('emotion <glob..>', 'Migrate Emotion styles to StyleX')
    .positional('glob', {
      describe: 'File glob(s) to transform',
      type: 'string',
    })
    .option('write', {
      type: 'boolean',
      default: false,
      describe: 'Apply changes (default: dry run — preview only)',
    })
    .option('config', {
      type: 'string',
      describe: 'Path to a stylex-codemod.config.js',
    })
    .option('verbose', {
      type: 'boolean',
      default: false,
      describe: 'List unchanged files and every TODO reason',
    })
    .demandCommand(1)
    .strict()
    .help()
    .parseSync();

  const adapter = String(args._[0]);
  if (adapter !== 'emotion') {
    process.stderr.write(`Unknown adapter '${adapter}' (only 'emotion').\n`);
    return 2;
  }

  const patterns = (args.glob ?? []).map(String);
  const config = loadConfig({ configPath: args.config ?? null });
  const report = runCodemod({ patterns, config, write: Boolean(args.write) });
  process.stdout.write(
    `${formatReport(report, { verbose: Boolean(args.verbose) })}\n`,
  );
  return report.summary.errors > 0 ? 1 : 0;
}

// $FlowFixMe[cannot-resolve-module] - require.main is a runtime guard
if (require.main === module) {
  process.exit(main(hideBin(process.argv)));
}
