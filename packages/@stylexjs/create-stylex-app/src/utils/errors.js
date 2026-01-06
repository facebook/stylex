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

class StylexError extends Error {
  constructor(message, suggestions = []) {
    super(message);
    this.suggestions = suggestions;
  }

  display() {
    console.log();
    logger.error(this.message);

    if (this.suggestions.length > 0) {
      console.log();
      console.log(ansis.dim('  Suggestions:'));
      this.suggestions.forEach((s) => {
        console.log(ansis.dim('  •'), s);
      });
    }
    console.log();
  }
}

const errors = {
  invalidProjectName: (name) =>
    new StylexError(`Invalid project name: "${name}"`, [
      'Project names can only contain lowercase letters, numbers, hyphens, and underscores',
      'Try: ' + logger.code(name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')),
    ]),

  directoryExists: (name) =>
    new StylexError(`Directory "${name}" already exists`, [
      'Choose a different project name',
      'Or remove the existing directory: ' + logger.command(`rm -rf ${name}`),
    ]),

  templateNotFound: (id) =>
    new StylexError(`Template "${id}" not found`, [
      'Available templates: nextjs, vite-react, vite',
      'Run without --framework flag to see all options',
    ]),

  installationFailed: (pm, exitCode) =>
    new StylexError(
      `Dependency installation failed (${pm} exited with code ${exitCode})`,
      [
        'Check your internet connection',
        'Try running ' + logger.command(`${pm} install`) + ' manually',
        'Or create project with: ' +
          logger.command('npx create-stylex-app my-app --no-install'),
      ],
    ),
};

module.exports = { StylexError, errors };
