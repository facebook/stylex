/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import fs from 'fs';
import path from 'path';
import errors from './errors';

// gets the directory for compiled styles (creates it if it doesn't exist)
export function makeCompiledDir(): void {
  if (!fs.existsSync(global.COMPILED_DIR)) {
    makeDirExistRecursive(global.COMPILED_DIR);
  }
}

export function getInputDirectoryFiles(inputDir: string): Array<string> {
  if (!fs.existsSync(inputDir)) {
    throw errors.dirNotFound;
  } else {
    const files = fs.readdirSync(inputDir, { recursive: true });
    return files.filter((file) => {
      const maybeDir = path.join(inputDir, file);
      return !isDir(maybeDir);
    });
  }
}

export function writeCompiledCSS(filePath: string, compiledCSS: string): void {
  fs.writeFileSync(filePath, compiledCSS);
}

export function writeCompiledJS(filePath: string, code: string): void {
  makeDirExistRecursive(filePath);
  fs.writeFileSync(filePath, code, {});
}

export function copyFile(filePath: string) {
  const src = path.join(global.INPUT_DIR, filePath);
  const dst = path.join(global.COMPILED_DIR, filePath);
  makeDirExistRecursive(dst);
  fs.copyFileSync(src, dst);
}

export function isDir(filePath: string): boolean {
  return fs.lstatSync(filePath).isDirectory();
}

export function isJSFile(filePath: string): boolean {
  const parsed = path.parse(filePath);
  return (
    parsed.ext === '.js' ||
    parsed.ext === '.ts' ||
    parsed.ext === '.jsx' ||
    parsed.ext === '.tsx' ||
    parsed.ext === '.cjs' ||
    parsed.ext === '.mjs'
  );
}

// e.g. ./pages/home/index.js -> ../../stylex_bundle.css
export function getCssPathFromFilePath(filePath: string): string {
  const from = path.resolve(filePath);
  const to = path.resolve(global.INPUT_DIR);
  const relativePath = path.relative(path.dirname(from), to);
  return formatRelativePath(path.join(relativePath, global.CSS_BUNDLE_NAME));
}

export function makeDirExistRecursive(filePath: string): ?boolean {
  const dirName = path.dirname(filePath);
  if (fs.existsSync(dirName) && dirName !== '.') {
    return true;
  }
  if (dirName === '.') {
    fs.mkdirSync(filePath);
    return;
  }
  makeDirExistRecursive(dirName);
  fs.mkdirSync(dirName);
}

export function removeCompiledDir(): void {
  fs.rmSync(global.COMPILED_DIR, { recursive: true, force: true });
}

function formatRelativePath(filePath: string) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}
