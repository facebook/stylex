#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const yargs = require('yargs/yargs');
const { execSync } = require('child_process');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv))
  .option('commit', {
    type: 'boolean',
  })
  .option('otp', {
    type: 'string',
  })
  .option('pkg-version', {
    alias: 'v',
    type: 'string',
    demandOption: true,
  })
  .option('publish', {
    type: 'boolean',
  }).argv;

const commit = args.commit;
const otp = args.otp;
const pkgVersion = args['pkg-version'];
const publish = args.publish;

console.log(`Creating release version "${pkgVersion}"`);

const repoRoot = path.join(__dirname, '../..');

// Collect workspaces and package manifests
const workspacePaths = require('../../package.json').workspaces.reduce(
  (acc, w) => {
    const resolvedPaths = glob.sync(path.join(repoRoot, w));
    resolvedPaths.forEach((p) => {
      // Remove duplicates and unrelated packages
      if (acc.indexOf(p) === -1) {
        acc.push(p);
      }
    });
    return acc;
  },
  [],
);

const workspaces = workspacePaths.map((dir) => {
  const directory = path.resolve(dir);
  const packageJsonPath = path.join(directory, 'package.json');
  // Skip empty workspaces
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }),
  );
  return { directory, packageJson, packageJsonPath };
}).filter(Boolean); // filter out null values

// Update each package version and its dependencies
const workspaceNames = workspaces.map(({ packageJson }) => packageJson.name);
workspaces.forEach(({ packageJson, packageJsonPath }) => {
  packageJson.version = pkgVersion;
  workspaceNames.forEach((name) => {
    if (packageJson.dependencies && packageJson.dependencies[name]) {
      packageJson.dependencies[name] = pkgVersion;
    }
    if (packageJson.devDependencies && packageJson.devDependencies[name]) {
      packageJson.devDependencies[name] = pkgVersion;
    }
  });
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );
});

console.log('Package manifest update complete');

execSync('cd ../..');

execSync('npm install', {
  stdio: 'inherit',
});

// Commit changes
if (commit) {
  // add changes
  execSync('git add .');
  // commit
  execSync(`git commit -m "${pkgVersion}" --no-verify`);
  // tag
  cexecSync(`git tag -m ${pkgVersion} "${pkgVersion}"`);
}

if (publish) {
  const publishCmd = otp == null ? 'npm publish' : `npm publish --otp ${otp}`;
  // publish public packages
  workspaces.forEach(({ directory, packageJson }) => {
    if (!packageJson.private) {
      execSync(`cd ${directory} && ${publishCmd}`, {
        stdio: 'inherit',
      });
    }
  });
  // push changes
  execSync('git push --tags origin main');
}
