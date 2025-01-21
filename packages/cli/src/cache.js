/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import fs from 'fs/promises';
import path from 'path';
import { utils } from '@stylexjs/shared';

const hash = utils.hash;

// Default cache directory in `node_modules/.stylex-cache`
export function getDefaultCachePath() {
  return path.join('node_modules', '.stylex-cache');
}

async function findProjectRoot(startDir = __dirname) {
  let currentDir = path.resolve(startDir);
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    try {
      await fs.access(packageJsonPath);
      return currentDir;
    } catch (error) {
      currentDir = path.dirname(currentDir);
    }
  }
  throw new Error('Project root not found');
}

export async function getCacheFilePath(cachePath, filePath) {
  const projectRoot = await findProjectRoot(filePath);
  const absoluteFilePath = path.resolve(filePath);
  const relativePath = path.relative(projectRoot, absoluteFilePath);
  const fileName = relativePath.replace(/[\\/]/g, '__');
  return path.join(cachePath, `${fileName}.json`);
}

export async function readCache(cachePath, filePath) {
  const cacheFile = await getCacheFilePath(cachePath, filePath);
  try {
    const cacheData = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cacheData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist
      return null;
    }
    throw error;
  }
}

export async function writeCache(cachePath, filePath, data) {
  const cacheFile = await getCacheFilePath(cachePath, filePath);
  const dirPath = path.dirname(cacheFile);

  await fs.mkdir(dirPath, { recursive: true });
  console.log('Writing cache to:', cacheFile);
  await fs.writeFile(cacheFile, JSON.stringify(data), 'utf-8');
}

export async function deleteCache(cachePath, filePath) {
  const cacheFile = await getCacheFilePath(cachePath, filePath);
  try {
    await fs.unlink(cacheFile);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      // Rethrow errors other than file not existing
      throw error;
    }
  }
}

export function computeStyleXConfigHash(config) {
  // Excluding `input` and `output` paths to hash config settings
  const configOptions = Object.fromEntries(
    Object.entries(config).filter(
      ([key]) => key !== 'input' && key !== 'output',
    ),
  );

  const jsonRepresentation = JSON.stringify(
    configOptions,
    Object.keys(configOptions).sort(),
  );

  return hash(jsonRepresentation);
}

export async function computeFilePathHash(filePath) {
  const absoluteFilePath = path.resolve(filePath);
  const parsedFile = path.parse(absoluteFilePath);

  await fs.mkdir(parsedFile.dir, { recursive: true });

  const possibleExtensions = ['.ts', '.js'];
  let newPath = absoluteFilePath;

  let fileExists = false;

  try {
    fileExists = await fs
      .access(newPath)
      .then(() => true)
      .catch(() => false);
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    for (const ext of possibleExtensions) {
      const tempPath = path.join(parsedFile.dir, `${parsedFile.name}${ext}`);
      fileExists = await fs
        .access(tempPath)
        .then(() => true)
        .catch(() => false);
      if (fileExists) {
        newPath = tempPath;
        break;
      }
    }
  }

  if (!fileExists) {
    throw new Error(`Error generating hash: file not found: ${newPath}`);
  }

  const content = await fs.readFile(newPath, 'utf-8');
  return hash(content);
}
