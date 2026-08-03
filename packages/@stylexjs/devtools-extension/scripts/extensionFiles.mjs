/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const requiredFiles = new Set([
  'assets/devtools.js',
  'assets/inspected-runtime.js',
  'assets/panel.js',
  'assets/reset.css',
  'assets/shared.js',
  'assets/stylex.css',
  'devtools.html',
  'manifest.json',
  'panel.html',
]);

async function listFiles(directory, relative = '') {
  const entries = await fs.readdir(path.join(directory, relative), {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const next = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(directory, next)));
    } else {
      assert(entry.isFile(), `Unexpected non-file output: ${next}`);
      files.push(next);
    }
  }
  return files.sort();
}

export async function verifyBrowserOutput(directory) {
  const files = await listFiles(directory);
  assert.deepEqual(
    files,
    Array.from(requiredFiles).sort(),
    'Extension output does not match the exact package allowlist.',
  );
  return files;
}

export async function verifySharedOutputs(chromeDir, firefoxDir) {
  const chromeFiles = await verifyBrowserOutput(chromeDir);
  const firefoxFiles = await verifyBrowserOutput(firefoxDir);
  assert.deepEqual(
    chromeFiles,
    firefoxFiles,
    'Browser output file lists differ.',
  );

  for (const file of chromeFiles) {
    if (file === 'manifest.json') continue;
    const [chromeFile, firefoxFile] = await Promise.all([
      fs.readFile(path.join(chromeDir, file)),
      fs.readFile(path.join(firefoxDir, file)),
    ]);
    assert(
      chromeFile.equals(firefoxFile),
      `Shared browser output differs: ${file}`,
    );
  }

  const chromeManifest = JSON.parse(
    await fs.readFile(path.join(chromeDir, 'manifest.json'), 'utf8'),
  );
  const firefoxManifest = JSON.parse(
    await fs.readFile(path.join(firefoxDir, 'manifest.json'), 'utf8'),
  );
  assert.equal(chromeManifest.version, '0.1.1');
  assert.equal(chromeManifest.minimum_chrome_version, '148');
  assert.equal(firefoxManifest.version, '0.1.1');
  assert.equal(
    firefoxManifest.browser_specific_settings.gecko.strict_min_version,
    '153.0',
  );
  assert.deepEqual(
    firefoxManifest.browser_specific_settings.gecko.data_collection_permissions
      .required,
    ['none'],
  );
  return chromeFiles;
}
