/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const { downloadTemplate } = require('giget');

const DEFAULT_REPO = 'facebook/stylex';
const DEFAULT_BRANCH = 'main';

/**
 * Fetch a template from the stylex examples directory
 */
async function fetchTemplate(templateConfig, targetDir) {
  const source = `github:${DEFAULT_REPO}/examples/${templateConfig.exampleSource}#${DEFAULT_BRANCH}`;

  await downloadTemplate(source, {
    dir: targetDir,
    force: true,
  });

  return targetDir;
}

/**
 * Fetch a custom template from a URL or GitHub reference
 * Supports:
 *   - "github:owner/repo/path"
 *   - "github:owner/repo/path#branch"
 *   - "gh:owner/repo/path" (shorthand)
 *   - Full GitHub URLs
 */
async function fetchCustomTemplate(templateSource, targetDir) {
  // giget handles github:, gh:, and full URLs natively
  await downloadTemplate(templateSource, {
    dir: targetDir,
    force: true,
  });

  return targetDir;
}

/**
 * Fetch the templates manifest from GitHub
 * This allows template definitions to be updated without updating the CLI
 */
async function fetchTemplatesManifest(
  repo = DEFAULT_REPO,
  branch = DEFAULT_BRANCH,
) {
  const manifestPath = 'packages/@stylexjs/create-stylex-app/templates.json';

  try {
    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');

    const tempDir = path.join(os.tmpdir(), `stylex-manifest-${Date.now()}`);
    await downloadTemplate(
      `github:${repo}/${path.dirname(manifestPath)}#${branch}`,
      {
        dir: tempDir,
        force: true,
      },
    );

    const manifestFile = path.join(tempDir, 'templates.json');
    if (await fs.pathExists(manifestFile)) {
      const content = await fs.readJson(manifestFile);
      await fs.remove(tempDir);
      return content;
    }

    await fs.remove(tempDir);
    return null;
  } catch (error) {
    // If manifest doesn't exist, return null (use bundled templates)
    return null;
  }
}

module.exports = {
  fetchTemplate,
  fetchCustomTemplate,
  fetchTemplatesManifest,
};
