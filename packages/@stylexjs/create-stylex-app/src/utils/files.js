/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');

/**
 * Recursively copy a directory while excluding certain files/directories
 */
async function copyDirectory(source, target, excludePatterns) {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (excludePatterns.includes(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await fs.ensureDir(targetPath);
      await copyDirectory(sourcePath, targetPath, excludePatterns);
    } else {
      await fs.copy(sourcePath, targetPath);
    }
  }
}

module.exports = { copyDirectory };
