/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

const fsPromises = require('fs/promises');
const path = require('path');

async function findFlowModules(inputDir, rootDir) {
  let flowModulePaths = {};

  let maybeFlowModules = path.resolve(inputDir, '../');
  while (isSubfolder(maybeFlowModules, rootDir)) {
    const targetPath = path.join(maybeFlowModules, 'flow_modules');
    if (await folderExists(targetPath)) {
      const foundTypePackages = await readDir(targetPath);
      flowModulePaths = { ...foundTypePackages, ...flowModulePaths };
    }
    maybeFlowModules = path.resolve(maybeFlowModules, '../');
  }

  return flowModulePaths;
}

function patchFlowModulePaths(filePath, fileContents, flowModulePaths) {
  const fileDir = path.dirname(filePath);

  let patchedFileContents = fileContents;
  for (const packageName in flowModulePaths) {
    const packagePath = flowModulePaths[packageName];

    const packagePathRegex = new RegExp(` from '${packageName}';`, 'g');
    patchedFileContents = patchedFileContents.replace(
      packagePathRegex,
      ` from '${path.relative(fileDir, packagePath)}';`,
    );
  }
  return patchedFileContents;
}

// A function indicates whether a folder exists at a given path
async function folderExists(path) {
  try {
    const stat = await fsPromises.stat(path);
    return stat.isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false; // Folder does not exist
    }
    throw err; // Other error occurred
  }
}

function isSubfolder(subfolderPath, parentFolderPath) {
  const relativePath = path.relative(parentFolderPath, subfolderPath);
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

async function readDir(targetPath) {
  try {
    const packages = await fsPromises.readdir(targetPath);
    const nameToPath = {};

    for (const packageName of packages) {
      if (packageName.startsWith('@')) {
        const subPackages = await readDir(path.join(targetPath, packageName));
        for (const subPackageName in subPackages) {
          nameToPath[`${packageName}/${subPackageName}`] =
            subPackages[subPackageName];
        }
      } else if (!packageName.startsWith('.')) {
        nameToPath[packageName] = path.join(targetPath, packageName);
      }
    }

    return nameToPath;
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

module.exports = { findFlowModules, patchFlowModulePaths };
