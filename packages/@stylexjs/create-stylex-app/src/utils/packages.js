/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const fs = require('fs-extra');
const spawn = require('cross-spawn');

/**
 * Detect which package manager to use based on lock files
 * @returns {Promise<'npm'|'yarn'|'pnpm'>}
 */
async function detectPackageManager() {
  // Check lock files in current directory
  if (await fs.pathExists('package-lock.json')) return 'npm';
  if (await fs.pathExists('yarn.lock')) return 'yarn';
  if (await fs.pathExists('pnpm-lock.yaml')) return 'pnpm';

  // Default to npm
  return 'npm';
}

/**
 * Install dependencies in the target directory
 * @param {string} targetDir - Directory where dependencies should be installed
 * @param {'npm'|'yarn'|'pnpm'} packageManager - Package manager to use
 * @returns {Promise<void>}
 */
async function installDependencies(targetDir, packageManager) {
  const result = spawn.sync(packageManager, ['install'], {
    cwd: targetDir,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    const { errors } = require('./errors');
    errors
      .installationFailed(packageManager, result.status || 'unknown')
      .display();
    process.exit(1);
  }
}

module.exports = {
  detectPackageManager,
  installDependencies,
};
