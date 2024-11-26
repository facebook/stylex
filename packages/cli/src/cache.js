/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// $FlowFixMe
import { mkdirp } from 'mkdirp';

// Default cache directory in `node_modules/.stylex-cache`
export function getDefaultCachePath() {
  return process.env.NODE_ENV === 'test'
    ? path.join('node_modules', '.stylex-cache-test')
    : path.join('node_modules', '.stylex-cache');
}

function getCacheFilePath(cachePath, filePath) {
  const fileName = filePath.replace(/[\\/]/g, '__');
  return path.join(cachePath, `${fileName}.json`);
}

export function readCache(filePath) {
  const cacheFile = getCacheFilePath(getDefaultCachePath(), filePath);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  }
  return null;
}

export function writeCache(cachePath, filePath, data) {
  const cacheFile = getCacheFilePath(cachePath, filePath);
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  console.log('Writing cache to:', cacheFile);
  fs.writeFileSync(cacheFile, JSON.stringify(data), 'utf-8');
}

export function deleteCache(cachePath, filePath) {
  const cacheFile = getCacheFilePath(cachePath, filePath);
  if (fs.existsSync(cacheFile)) {
    fs.unlinkSync(cacheFile);
  }
}

export function computeHash(filePath) {
  const absoluteFilePath = path.resolve(filePath);
  const parsedFile = path.parse(absoluteFilePath);

  mkdirp.sync(parsedFile.dir);

  const possibleExtensions = ['.ts', '.js'];
  let newPath = absoluteFilePath;

  if (!fs.existsSync(newPath)) {
    for (const ext of possibleExtensions) {
      const tempPath = path.join(parsedFile.dir, `${parsedFile.name}${ext}`);
      if (fs.existsSync(tempPath)) {
        newPath = tempPath;
        break;
      }
    }
  }

  if (!fs.existsSync(newPath)) {
    throw new Error(`Error generating hash: file not found: ${newPath}`);
  }

  const content = fs.readFileSync(newPath, 'utf-8');

  return crypto.createHash('md5').update(content).digest('hex');
}
