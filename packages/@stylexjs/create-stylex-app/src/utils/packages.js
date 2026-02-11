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
 * @returns {Promise<{packageCount: number|null}>} - Installation result with package count
 */
async function installDependencies(targetDir, packageManager) {
  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, ['install'], {
      cwd: targetDir,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const error = new Error(
          `${packageManager} install failed with exit code ${code}`,
        );
        // $FlowFixMe[prop-missing] - Adding custom properties for error context
        error.stderr = stderr;
        // $FlowFixMe[prop-missing]
        error.stdout = stdout;
        reject(error);
        return;
      }

      // Try to extract package count from npm/yarn/pnpm output
      let packageCount = null;
      const npmMatch = stdout.match(/added (\d+) packages?/i);
      // TODO: Add package count extraction for yarn/pnpm
      const _yarnMatch = stdout.match(/Done in [\d.]+s/i);
      const _pnpmMatch = stdout.match(/packages? are ready/i);

      if (npmMatch) {
        packageCount = parseInt(npmMatch[1], 10);
      }

      resolve({ packageCount });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  detectPackageManager,
  installDependencies,
};
