/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const ansis = require('ansis');
const { logger } = require('./logger');

const primary = '#5B45DE';
const secondary = '#D573DD';

function showSuccessScreen(
  projectName,
  targetDir,
  template,
  packageManager,
  didInstall,
) {
  console.log('\n');
  console.log(ansis.hex(primary).bold('━'.repeat(60)));
  console.log(
    ansis.green.bold('  ✨ Success!'),
    'Your StyleX project is ready',
  );
  console.log(ansis.hex(primary).bold('━'.repeat(60)));
  console.log();

  console.log(ansis.bold('  Project:'), logger.code(projectName));
  console.log(ansis.bold('  Template:'), template.name);
  console.log(ansis.bold('  Location:'), logger.path(targetDir));
  console.log();

  console.log(ansis.hex(secondary).bold('  Next steps:\n'));

  console.log(ansis.dim('  1.'), 'Navigate to your project');
  console.log('    ', logger.command(`cd ${projectName}`));
  console.log();

  if (!didInstall) {
    console.log(ansis.dim('  2.'), 'Install dependencies');
    console.log('    ', logger.command(`${packageManager} install`));
    console.log();
  }

  const stepNum = didInstall ? 2 : 3;
  console.log(ansis.dim(`  ${stepNum}.`), 'Start the development server');
  console.log('    ', logger.command(`${packageManager} run dev`));
  console.log();

  console.log(ansis.dim('  Learn more:'));
  console.log('    ', ansis.cyan('https://stylexjs.com/docs/learn'));
  console.log();

  console.log(ansis.hex(primary).bold('━'.repeat(60)));
  console.log();
}

module.exports = { showSuccessScreen };
